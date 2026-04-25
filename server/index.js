const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Movie = require('./models/Movie');
const Review = require('./models/Review');
const User = require('./models/User');
const tmdb = require('./tmdb');
const auth = require('./middleware/auth');
const recommendations = require('./recommendationService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/letsreview')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    
    const user = new User({ username, email, password, role, avatarUrl });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ token, user: { id: user._id, username, role, avatarUrl } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, avatarUrl: user.avatarUrl } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- MOVIE ROUTES ---

app.get('/api/movies', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Try TMDB first, fall back to local DB on failure
    if (tmdb.isKeySet()) {
      try {
        let tmdbMovies = [];
        if (search) {
          tmdbMovies = await tmdb.searchMovies(search);
        } else if (category === 'Trending') {
          tmdbMovies = await tmdb.fetchTrendingMovies();
        } else if (category === 'OTT') {
          tmdbMovies = await tmdb.fetchOTTMovies();
        } else if (category === 'Theatre') {
          tmdbMovies = await tmdb.fetchNowPlaying();
        } else if (category === 'New') {
          tmdbMovies = await tmdb.fetchNewReleases();
        }
        
        if (tmdbMovies && tmdbMovies.length > 0) {
          return res.json(tmdbMovies);
        }
      } catch (tmdbErr) {
        console.warn('TMDB fetch failed, falling back to local DB:', tmdbErr.message);
      }
    }

    // Fallback to local DB
    let query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const movies = await Movie.find(query).sort({ releaseYear: -1, rating: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    // If ID is numeric, it's a TMDB ID
    if (!isNaN(req.params.id)) {
      // Try TMDB first
      if (tmdb.isKeySet()) {
        try {
          const tmdbMovie = await tmdb.fetchMovieDetails(req.params.id);
          if (tmdbMovie) return res.json(tmdbMovie);
        } catch (tmdbErr) {
          console.warn('TMDB details fetch failed, trying local DB:', tmdbErr.message);
        }
      }
      // Fallback: find by tmdbId in local DB
      const movie = await Movie.findOne({ tmdbId: parseInt(req.params.id) });
      if (movie) return res.json(movie);
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- CRITIC ROUTES ---

app.get('/api/critics', async (req, res) => {
  try {
    const critics = await User.find({ role: 'critic' }).select('-password');
    res.json(critics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/critics/:id/follow', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.following.includes(req.params.id)) {
      user.following.pull(req.params.id);
    } else {
      user.following.push(req.params.id);
    }
    await user.save();
    res.json({ following: user.following });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- ADMIN SYNC ROUTES ---

app.post('/api/admin/sync-media', auth, async (req, res) => {
  try {
    if (!tmdb.isKeySet()) {
      return res.status(400).json({ error: 'TMDB API key is not configured in .env' });
    }

    const movies = await Movie.find({});
    let syncCount = 0;

    for (const movie of movies) {
      try {
        let tmdbData = null;
        
        // If we have a tmdbId, fetch directly
        if (movie.tmdbId) {
          tmdbData = await tmdb.fetchMovieDetails(movie.tmdbId);
        } else {
          // Otherwise search by title
          const searchResults = await tmdb.searchMovies(movie.title);
          if (searchResults && searchResults.length > 0) {
            tmdbData = await tmdb.fetchMovieDetails(searchResults[0].tmdbId);
          }
        }

        if (tmdbData) {
          movie.tmdbId = tmdbData.tmdbId;
          movie.posterUrl = tmdbData.posterUrl || movie.posterUrl;
          movie.bannerUrl = tmdbData.bannerUrl || movie.bannerUrl;
          movie.synopsis = tmdbData.synopsis || movie.synopsis;
          await movie.save();
          syncCount++;
        }
      } catch (err) {
        console.error(`Failed to sync movie: ${movie.title}`, err.message);
      }
    }

    res.json({ message: `Successfully synced ${syncCount} movies with TMDB` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- USER PROFILE & LIST ROUTES ---

app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('following', 'username avatarUrl role');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resolveMovies = async (ids) => {
      const results = [];
      for (const id of ids) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const m = await Movie.findById(id);
          if (m) results.push(m);
        } else {
          if (tmdb.isKeySet()) {
            try {
              const t = await tmdb.fetchMovieDetails(id);
              if (t) results.push({ ...t, _id: id });
            } catch (err) {
              console.warn(`Failed to resolve TMDB id ${id}:`, err.message);
            }
          }
        }
      }
      return results;
    };

    const userObj = user.toObject();
    userObj.watchlist = await resolveMovies(user.watchlist || []);
    userObj.watched = await resolveMovies(user.watched || []);

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/watchlist/toggle', auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user.watchlist.includes(movieId)) {
      user.watchlist.pull(movieId);
    } else {
      user.watchlist.push(movieId);
    }
    
    await user.save();
    res.json({ watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/watched/toggle', auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user.watched.includes(movieId)) {
      user.watched.pull(movieId);
    } else {
      user.watched.push(movieId);
    }
    
    await user.save();
    res.json({ watched: user.watched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- REVIEW ROUTES ---

app.post('/api/reviews', auth, async (req, res) => {
  try {
    const { movieId, movieTitle, rating, comment } = req.body;
    const user = await User.findById(req.user.id);

    const newReview = new Review({
      username: user.username,
      avatarUrl: user.avatarUrl,
      movieId: String(movieId),
      movieTitle: movieTitle,
      rating,
      comment,
      userRole: user.role
    });

    const savedReview = await newReview.save();
    io.emit('new_review', savedReview);

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const { movieId } = req.query;
    let query = {};
    if (movieId) query.movieId = movieId;

    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// --- RECOMMENDATION ROUTES ---

app.get('/api/recommendations/movies', auth, async (req, res) => {
  try {
    const movies = await recommendations.getMovieRecommendations(req.user.id);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recommendations/critics', auth, async (req, res) => {
  try {
    const critics = await recommendations.getCriticSuggestions(req.user.id);
    res.json(critics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

