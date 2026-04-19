const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

const movies = [
  // Trending
  {
    tmdbId: 693134,
    title: "Dune: Part Two",
    synopsis: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    rating: 4.8, category: "Trending", platform: "Theatre", genre: "Sci-Fi", language: "English", releaseYear: 2024, reviewsCount: 8
  },
  {
    tmdbId: 792307,
    title: "Poor Things",
    synopsis: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant scientist Dr. Godwin Baxter.",
    rating: 4.6, category: "Trending", platform: "Theatre", genre: "Drama", language: "English", releaseYear: 2023, reviewsCount: 5
  },
  {
    tmdbId: 823464,
    title: "Godzilla x Kong: The New Empire",
    synopsis: "Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island's mysteries.",
    rating: 4.0, category: "Trending", platform: "Theatre", genre: "Action", language: "English", releaseYear: 2024, reviewsCount: 6
  },

  // New Releases
  {
    tmdbId: 801688,
    title: "Kalki 2898 AD",
    synopsis: "Set in a futuristic dystopia, this mythological sci-fi epic follows the prophesied incarnation of Vishnu who arrives to defeat a tyrant.",
    rating: 4.7, category: "New", platform: "Theatre", genre: "Sci-Fi", language: "Telugu", releaseYear: 2024, reviewsCount: 12
  },
  {
    tmdbId: 1022789,
    title: "Inside Out 2",
    synopsis: "Riley's mind headquarters gets a major renovation when new emotions arrive just as she is about to start high school.",
    rating: 4.5, category: "New", platform: "Theatre", genre: "Animation", language: "English", releaseYear: 2024, reviewsCount: 9
  },

  // OTT
  {
    tmdbId: 872585,
    title: "Oppenheimer",
    synopsis: "The story of J. Robert Oppenheimer and his pivotal role in the development of the atomic bomb during WWII.",
    rating: 4.5, category: "OTT", platform: "Peacock", genre: "Biography", language: "English", releaseYear: 2023, reviewsCount: 7
  },
  {
    tmdbId: 466420,
    title: "Killers of the Flower Moon",
    synopsis: "Members of the Osage tribe are systematically murdered after oil is discovered on their land in 1920s Oklahoma.",
    rating: 4.3, category: "OTT", platform: "Apple TV+", genre: "Crime", language: "English", releaseYear: 2023, reviewsCount: 4
  },
  {
    tmdbId: 929590,
    title: "Civil War",
    synopsis: "A team of journalists race against time across a war-torn America to reach Washington D.C. before rebel forces close in.",
    rating: 4.2, category: "OTT", platform: "Prime Video", genre: "Action", language: "English", releaseYear: 2024, reviewsCount: 5
  },
  {
    tmdbId: 229334,
    title: "Heeramandi: The Diamond Bazaar",
    synopsis: "Set in the red-light district of pre-independence India, this saga follows the lives of courtesans and the freedom struggle.",
    rating: 4.1, category: "OTT", platform: "Netflix", genre: "Drama", language: "Hindi", releaseYear: 2024, reviewsCount: 6
  },

  // Theatre
  {
    tmdbId: 957196,
    title: "Fighter",
    synopsis: "Top IAF aviators unite as Air Dragons to defend the nation in the face of imminent danger.",
    rating: 4.1, category: "Theatre", platform: "Theatre", genre: "Action", language: "Hindi", releaseYear: 2024, reviewsCount: 8
  },
  {
    tmdbId: 1104595,
    title: "STREE 2",
    synopsis: "The haunted town of Chanderi faces a new supernatural threat while the gang from Stree must band together again.",
    rating: 4.6, category: "Theatre", platform: "Theatre", genre: "Horror-Comedy", language: "Hindi", releaseYear: 2024, reviewsCount: 14
  },
  {
    tmdbId: 945961,
    title: "Alien: Romulus",
    synopsis: "Young colonists on a distant world find themselves face to face with the most terrifying life form in the universe.",
    rating: 4.2, category: "Theatre", platform: "Theatre", genre: "Horror", language: "English", releaseYear: 2024, reviewsCount: 7
  }
];

const reviews = [
  { username: "CinemaLover88", rating: 5, comment: "Absolutely breathtaking cinematography! Dune Part Two is everything we hoped for and more. Denis Villeneuve is a master.", movieTitle: "Dune: Part Two" },
  { username: "FilmCritic_Pro", rating: 4, comment: "Visually stunning but slightly slow in the second act. Still a must-watch for sci-fi fans.", movieTitle: "Dune: Part Two" },
  { username: "PriyaK", rating: 5, comment: "Kalki 2898 AD blew my mind! The mythological sci-fi blend is unprecedented in Indian cinema.", movieTitle: "Kalki 2898 AD" },
  { username: "Ravi_Movies", rating: 4, comment: "Prabhas carried this entire movie. The VFX are top-notch!", movieTitle: "Kalki 2898 AD" },
  { username: "MovieBuffMike", rating: 5, comment: "Oppenheimer is Nolan's magnum opus. Cillian Murphy is outstanding.", movieTitle: "Oppenheimer" },
  { username: "Sarah_Reviews", rating: 5, comment: "I watched Poor Things twice. Emma Stone richly deserved the Oscar.", movieTitle: "Poor Things" },
  { username: "KollywoodFan", rating: 5, comment: "Stree 2 is the ultimate horror comedy sequel. Shraddha nailed it!", movieTitle: "STREE 2" },
  { username: "CriticWatch", rating: 3, comment: "Civil War was intense but felt incomplete. Great concept though.", movieTitle: "Civil War" }
];

mongoose.connect('mongodb://127.0.0.1:27017/letsreview').then(async () => {
  console.log('MongoDB connected for seeding');

  await Movie.deleteMany({});
  await Review.deleteMany({});
  console.log('Cleared existing data');

  const insertedMovies = await Movie.insertMany(movies);
  console.log(`Seeded ${insertedMovies.length} movies`);

  // Match reviews to movie IDs
  for (const review of reviews) {
    const movie = insertedMovies.find(m => m.title === review.movieTitle);
    if (movie) {
      await new Review({
        username: review.username,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.username}`,
        movieId: movie._id,
        movieTitle: review.movieTitle,
        rating: review.rating,
        comment: review.comment
      }).save();
    }
  }
  console.log(`Seeded ${reviews.length} reviews`);

  mongoose.connection.close();
}).catch(err => { console.error(err); process.exit(1); });
