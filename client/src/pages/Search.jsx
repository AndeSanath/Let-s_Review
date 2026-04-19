import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon, Filter } from 'lucide-react';

export default function Search() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/movies?search=${query}`);
        setMovies(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="search-page animate-fade-in">
      <div className="section-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
          <SearchIcon size={32} /> Results for "{query}"
        </h1>
        <button className="btn btn-glass">
          <Filter size={18} /> Filters
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-5" style={{ marginTop: '2rem' }}>
          {movies.length > 0 ? (
            movies.map(movie => <MovieCard key={movie._id || movie.tmdbId} movie={movie} />)
          ) : (
            <p className="text-secondary">No movies found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
