import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ImageOff } from 'lucide-react';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=500';

  const movieId = movie._id || movie.tmdbId;

  return (
    <Link to={`/movie/${movieId}`} className="movie-card animate-fade-in">
      <div className="movie-poster">
        {!isLoaded && !error && <div className="skeleton shimmer" />}
        {error ? (
          <div className="image-error-placeholder">
            <ImageOff size={32} />
            <span>Image Unavailable</span>
          </div>
        ) : (
          <img 
            src={movie.posterUrl || fallbackImage} 
            alt={movie.title} 
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            style={{ opacity: isLoaded ? 1 : 0 }}
          />
        )}
        <div className="movie-overlay">
          <button className="btn btn-primary">View Details</button>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-rating">
            <Star size={14} fill="var(--star-color)" stroke="none" />
            {movie.rating ? movie.rating.toFixed(1) : 'New'}
          </span>
          <span className="movie-genre">{movie.genre}</span>
        </div>
      </div>
    </Link>
  );
}
