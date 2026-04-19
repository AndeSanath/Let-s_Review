import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

export default function Categories() {
  const { type } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/movies?category=${type}`);
        setMovies(res.data);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [type]);

  return (
    <div className="categories-page animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>{type} Movies</h1>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="grid grid-cols-5">
          {movies.length > 0 ? (
            movies.map(movie => <MovieCard key={movie._id} movie={movie} />)
          ) : (
            <p className="text-secondary">No movies found in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
