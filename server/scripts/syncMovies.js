require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const tmdb = require('../tmdb');

async function syncAllMovies() {
  try {
    console.log('--- TMDB Synchronization Script ---');
    
    if (!tmdb.isKeySet()) {
      console.error('ERROR: TMDB_API_KEY is not configured in server/.env');
      process.exit(1);
    }

    await mongoose.connect('mongodb://127.0.0.1:27017/letsreview');
    console.log('Connected to MongoDB');

    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies in database.`);

    let updatedCount = 0;
    let failedCount = 0;

    for (const movie of movies) {
      console.log(`\nSyncing: "${movie.title}"...`);
      try {
        let tmdbData = null;
        
        if (movie.tmdbId) {
          console.log(`- Using existing TMDB ID: ${movie.tmdbId}`);
          tmdbData = await tmdb.fetchMovieDetails(movie.tmdbId);
        } else {
          console.log(`- Searching for TMDB ID by title...`);
          const searchResults = await tmdb.searchMovies(movie.title);
          if (searchResults && searchResults.length > 0) {
            const bestMatch = searchResults[0];
            console.log(`- Found match: ${bestMatch.title} (ID: ${bestMatch.tmdbId})`);
            tmdbData = await tmdb.fetchMovieDetails(bestMatch.tmdbId);
          } else {
            console.warn(`- ⚠️ No match found for "${movie.title}"`);
          }
        }

        if (tmdbData) {
          movie.tmdbId = tmdbData.tmdbId;
          movie.posterUrl = tmdbData.posterUrl || movie.posterUrl;
          movie.bannerUrl = tmdbData.bannerUrl || movie.bannerUrl;
          movie.synopsis = tmdbData.synopsis || movie.synopsis;
          
          await movie.save();
          console.log(`- ✅ Successfully updated metadata and posters.`);
          updatedCount++;
        }
      } catch (err) {
        console.error(`- ❌ Error syncing "${movie.title}":`, err.message);
        failedCount++;
      }
    }

    console.log('\n--- Sync Complete ---');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Failed:  ${failedCount}`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
}

syncAllMovies();
