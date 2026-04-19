const axios = require('axios');

const TMDB_KEY = () => process.env.TMDB_API_KEY;
const BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMG = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

const isKeySet = () => {
  const key = TMDB_KEY();
  return key && key !== 'YOUR_TMDB_API_KEY_HERE' && key !== '';
};

// Map TMDB movie object → our schema shape
function mapMovie(m, category, platform) {
  return {
    tmdbId: m.id,
    title: m.title || m.original_title,
    posterUrl: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
    bannerUrl: m.backdrop_path ? `${IMG}/original${m.backdrop_path}` : null,
    synopsis: m.overview,
    rating: m.vote_average ? parseFloat((m.vote_average / 2).toFixed(1)) : 0,
    category,
    platform: platform || 'Theatre',
    genre: m.genre_ids ? genreName(m.genre_ids[0]) : 'Unknown',
    language: m.original_language ? m.original_language.toUpperCase() : 'EN',
    releaseYear: m.release_date ? parseInt(m.release_date.slice(0, 4)) : new Date().getFullYear(),
    reviewsCount: Math.floor(m.vote_count / 200),
  };
}

// Genre lookup (subset of TMDB genre IDs)
const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western', 10770: 'TV Movie'
};
function genreName(id) { return GENRES[id] || 'Drama'; }

// Fetch with fallback/retry
async function tmdbGet(endpoint, params = {}, retries = 3) {
  const url = `${BASE}${endpoint}`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, { params: { api_key: TMDB_KEY(), language: 'en-US', ...params } });
      return res.data.results || [];
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function fetchTrendingMovies() {
  if (!isKeySet()) return null;
  const results = await tmdbGet('/trending/movie/week');
  return results.slice(0, 10).map(m => mapMovie(m, 'Trending', 'Theatre'));
}

async function fetchNowPlaying() {
  if (!isKeySet()) return null;
  const results = await tmdbGet('/movie/now_playing', { region: 'IN' });
  return results.slice(0, 10).map(m => mapMovie(m, 'Theatre', 'Theatre'));
}

async function fetchNewReleases() {
  if (!isKeySet()) return null;
  // Popular recent movies as "New Releases"
  const results = await tmdbGet('/movie/popular', { region: 'IN' });
  return results.slice(0, 10).map(m => mapMovie(m, 'New', 'Theatre'));
}

async function fetchOTTMovies() {
  if (!isKeySet()) return null;
  // OTT: discover with streaming watch providers
  const results = await tmdbGet('/discover/movie', {
    sort_by: 'popularity.desc',
    with_watch_monetization_types: 'flatrate',
    watch_region: 'IN'
  });
  const platforms = ['Netflix', 'Prime Video', 'Apple TV+', 'Disney+', 'Hulu'];
  return results.slice(0, 10).map((m, i) => mapMovie(m, 'OTT', platforms[i % platforms.length]));
}

async function fetchMovieDetails(tmdbId, retries = 3) {
  if (!isKeySet()) return null;
  const url = `${BASE}/movie/${tmdbId}`;
  let m = null;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, {
        params: { api_key: TMDB_KEY(), language: 'en-US', append_to_response: 'videos,credits' }
      });
      m = res.data;
      break;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!m) return null;
  const trailer = m.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  return {
    ...mapMovie(m, 'Theatre', 'Theatre'),
    trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
    runtime: m.runtime,
    tagline: m.tagline,
    cast: m.credits?.cast?.slice(0, 6).map(c => ({ name: c.name, character: c.character, photo: c.profile_path ? `${IMG}/w185${c.profile_path}` : null })) || []
  };
}

async function searchMovies(query) {
  if (!isKeySet()) return null;
  const results = await tmdbGet('/search/movie', { query });
  return results.slice(0, 20).map(m => mapMovie(m, 'Trending', 'Theatre'));
}

module.exports = { fetchTrendingMovies, fetchNowPlaying, fetchNewReleases, fetchOTTMovies, fetchMovieDetails, searchMovies, isKeySet };
