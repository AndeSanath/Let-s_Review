require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

const TMDB_KEY = process.env.TMDB_API_KEY;
const IMG = "https://image.tmdb.org/t/p";

if (!TMDB_KEY || TMDB_KEY === '946d4f68d1295e136c001986a7b41b05') {
  console.error('ERROR: TMDB_API_KEY is not set in .env');
  process.exit(1);
}

const movieTitles = [
  "Dune: Part Two", "Poor Things", "Godzilla x Kong: The New Empire",
  "Kalki 2898 AD", "Inside Out 2", "Oppenheimer",
  "Killers of the Flower Moon", "Civil War", "Heeramandi: The Diamond Bazaar",
  "Fighter", "STREE 2", "Alien: Romulus"
];

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/letsreview');
  console.log('Connected to MongoDB');

  await Movie.deleteMany({});
  console.log('Cleared movies');

  for (const title of movieTitles) {
    try {
      console.log(`Searching for ${title}...`);
      const searchRes = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: { api_key: TMDB_KEY, query: title }
      });

      if (searchRes.data.results.length > 0) {
        const m = searchRes.data.results[0];
        const movie = new Movie({
          title: m.title,
          posterUrl: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
          bannerUrl: m.backdrop_path ? `${IMG}/original${m.backdrop_path}` : null,
          synopsis: m.overview,
          rating: parseFloat((m.vote_average / 2).toFixed(1)),
          category: "Trending", // Default
          platform: "Theatre",
          genre: "Drama", // Simplified
          language: m.original_language.toUpperCase(),
          releaseYear: parseInt(m.release_date.slice(0, 4)),
          reviewsCount: Math.floor(m.vote_count / 100)
        });
        await movie.save();
        console.log(`✅ Saved ${title}`);
      } else {
        console.log(`❌ Not found: ${title}`);
      }
    } catch (err) {
      console.error(`Failed for ${title}: ${err.message}`);
    }
  }

  process.exit(0);
}

seed();
