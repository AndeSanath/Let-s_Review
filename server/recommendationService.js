const Movie = require('./models/Movie');
const Review = require('./models/Review');
const User = require('./models/User');
const tmdb = require('./tmdb');

const GENRE_LIST = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
  'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 
  'Thriller', 'War', 'Western', 'TV Movie'
];

/**
 * Cosine Similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
    mA += (vecA[i] || 0) * (vecA[i] || 0);
    mB += (vecB[i] || 0) * (vecB[i] || 0);
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
}

/**
 * Convert a movie's genres into a feature vector
 */
function getMovieVector(movie) {
  const vector = new Array(GENRE_LIST.length).fill(0);
  if (movie.genre) {
    const genres = String(movie.genre).split(',').map(g => g.trim());
    genres.forEach(g => {
      const index = GENRE_LIST.indexOf(g);
      if (index !== -1) vector[index] = 1;
    });
  }
  return vector;
}

/**
 * Get movie recommendations for a user
 */
async function getMovieRecommendations(userId) {
  const user = await User.findById(userId);
  if (!user) return [];

  // 1. Get user's liked movies (rating >= 4) or watched movies
  const userReviews = await Review.find({ username: user.username, rating: { $gte: 4 } });
  const likedMovieIds = userReviews.map(r => r.movieId);
  const watchedMovieIds = user.watched || [];
  
  const allInterestingIds = [...new Set([...likedMovieIds, ...watchedMovieIds])];
  if (allInterestingIds.length === 0) {
    // If no data, return trending movies with 0 similarity
    const trending = await tmdb.fetchTrendingMovies();
    return (trending || []).map(m => ({ ...m, similarity: 0 }));
  }

  // 2. Fetch details for these movies to build user profile vector
  const userProfileVector = new Array(GENRE_LIST.length).fill(0);
  let count = 0;

  for (const id of allInterestingIds) {
    let movie;
    if (require('mongoose').Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    } else if (!isNaN(id)) {
      movie = await Movie.findOne({ tmdbId: parseInt(id) });
    }

    if (!movie && !isNaN(id)) {
      try {
        movie = await tmdb.fetchMovieDetails(id);
      } catch (err) {
        console.warn(`Failed to fetch TMDB details for ${id}:`, err.message);
      }
    }
    
    if (movie) {
      const v = getMovieVector(movie);
      for (let i = 0; i < v.length; i++) {
        userProfileVector[i] += v[i];
      }
      count++;
    }
  }

  // Normalize user profile vector
  if (count > 0) {
    for (let i = 0; i < userProfileVector.length; i++) {
      userProfileVector[i] /= count;
    }
  }

  // 3. Get candidate movies (Trending + OTT + Local)
  let candidates = [];
  const trending = await tmdb.fetchTrendingMovies();
  const ott = await tmdb.fetchOTTMovies();
  const local = await Movie.find({}).limit(50);

  candidates = [...(trending || []), ...(ott || []), ...local];
  
  // Remove duplicates and movies already watched
  const uniqueCandidates = [];
  const seenIds = new Set(allInterestingIds.map(String));
  
  candidates.forEach(c => {
    const id = String(c.tmdbId || c._id);
    if (!seenIds.has(id)) {
      uniqueCandidates.push(c);
      seenIds.add(id);
    }
  });

  // 4. Calculate similarity and rank
  const scoredMovies = uniqueCandidates.map(movie => {
    // Ensure we have a plain object
    const movieObj = movie.toObject ? movie.toObject() : movie;
    const movieVector = getMovieVector(movieObj);
    
    // Core similarity
    let similarity = cosineSimilarity(userProfileVector, movieVector);
    
    // Add a tiny bit of random noise (0-1%) to break ties and provide variety
    similarity += Math.random() * 0.01;

    return { ...movieObj, similarity };
  });

  return scoredMovies
    .filter(m => m.title)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
}

/**
 * Suggest critics based on liked/watched movies where critic gave high rating
 */
async function getCriticSuggestions(userId) {
  const user = await User.findById(userId);
  if (!user) return [];

  const userReviews = await Review.find({ username: user.username, rating: { $gte: 4 } });
  const likedMovieIds = userReviews.map(r => r.movieId);
  const watchedMovieIds = user.watched || [];
  const allInterestIds = [...new Set([...likedMovieIds, ...watchedMovieIds])];

  if (allInterestIds.length === 0) {
    // If no user data, return most active critics
    return await User.find({ role: 'critic' }).limit(5).select('-password');
  }

  // Find critics who reviewed these movies
  const criticReviews = await Review.find({
    movieId: { $in: allInterestIds },
    userRole: 'critic',
    rating: { $gte: 4 }
  });

  // Aggregate critics and their "match count"
  const criticMatches = {};
  criticReviews.forEach(r => {
    criticMatches[r.username] = (criticMatches[r.username] || 0) + 1;
  });

  const sortedCritics = Object.keys(criticMatches)
    .sort((a, b) => criticMatches[b] - criticMatches[a])
    .slice(0, 5);

  const suggestedCritics = await User.find({
    username: { $in: sortedCritics },
    role: 'critic'
  }).select('-password');

  // If we found fewer than 3 matches, pad with other critics
  if (suggestedCritics.length < 3) {
    const otherCritics = await User.find({
      role: 'critic',
      username: { $nin: [...sortedCritics, user.username] }
    }).limit(3 - suggestedCritics.length).select('-password');
    return [...suggestedCritics, ...otherCritics];
  }

  return suggestedCritics;
}

module.exports = { getMovieRecommendations, getCriticSuggestions };
