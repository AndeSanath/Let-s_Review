require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('../models/Movie');
const tmdb = require('../tmdb');

const TMDB_KEY = process.env.TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

async function smartSync() {
  try {
    console.log('--- TMDB Smart Discovery Sync ---');
    
    if (!TMDB_KEY || TMDB_KEY === 'YOUR_TMDB_API_KEY_HERE') {
      console.error('ERROR: TMDB_API_KEY is not configured in server/.env');
      process.exit(1);
    }

    await mongoose.connect('mongodb://127.0.0.1:27017/letsreview');
    console.log('Connected to MongoDB');

    const movies = await Movie.find({});
    console.log(`Searching for updates for ${movies.length} movies...`);

    for (const movie of movies) {
      console.log(`\n🔎 Discovery: "${movie.title}"`);
      try {
        // 1. Search multi (finds movie or tv)
        const searchRes = await axios.get(`${BASE}/search/multi`, {
          params: { api_key: TMDB_KEY, query: movie.title, language: 'en-US' }
        });

        const results = searchRes.data.results;
        if (results && results.length > 0) {
          // Find best match (prefer most popular/recent)
          const match = results[0];
          const type = match.media_type; // 'movie' or 'tv'
          console.log(`- Match found: "${match.title || match.name}" (${type})`);

          // 2. Fetch full details (different endpoints for movie vs tv)
          const detailRes = await axios.get(`${BASE}/${type}/${match.id}`, {
            params: { api_key: TMDB_KEY, language: 'en-US' }
          });
          const d = detailRes.data;

          // 3. Update database
          movie.tmdbId = d.id;
          movie.posterUrl = d.poster_path ? `${IMG}/w500${d.poster_path}` : movie.posterUrl;
          movie.bannerUrl = d.backdrop_path ? `${IMG}/original${d.backdrop_path}` : movie.bannerUrl;
          movie.synopsis = d.overview || movie.synopsis;
          
          if (!movie.genre || movie.genre === 'Drama') {
            movie.genre = d.genres && d.genres.length > 0 ? d.genres[0].name : movie.genre;
          }

          await movie.save();
          console.log(`- ✅ Successfully synced original posters and metadata.`);
        } else {
          console.warn(`- ⚠️ No TMDB match found for "${movie.title}"`);
        }
      } catch (err) {
        console.error(`- ❌ Error fetching "${movie.title}":`, err.message);
      }
    }

    console.log('\n--- Smart Sync Complete ---');
    mongoose.connection.close();
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
}

smartSync();
