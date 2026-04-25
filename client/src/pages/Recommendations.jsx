import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Star, Users, ArrowRight, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import './Recommendations.css';

export default function Recommendations() {
  const [movies, setMovies] = useState([]);
  const [critics, setCritics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to see personalized recommendations.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const [movieRes, criticRes] = await Promise.all([
        axios.get('/api/recommendations/movies', { headers }),
        axios.get('/api/recommendations/critics', { headers })
      ]);

      setMovies(movieRes.data);
      setCritics(criticRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleFollow = async (criticId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/critics/${criticId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCritics(prev => prev.map(c => 
        c._id === criticId ? { ...c, isFollowing: !c.isFollowing } : c
      ));
    } catch (err) {
      console.error("Error following critic:", err);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="recommendations-container animate-fade-in">
      <header className="recommendations-header">
        <div className="title-area">
          <Sparkles className="icon-sparkle" />
          <h1>For You</h1>
          <button onClick={handleRefresh} className="btn-refresh" title="Refresh Recommendations">
            <RefreshCw size={18} />
          </button>
        </div>
        <p className="subtitle">Personalized movie picks and critics based on your taste.</p>
      </header>

      {error && (
        <div className="error-view">
          <p className="error-message">{error}</p>
          <Link to="/login" className="btn btn-primary">Login Now</Link>
        </div>
      )}

      {!error && (
        <>
          <section className="recommendations-section">
            <div className="section-header">
              <div className="section-title">
                <Play size={20} className="section-icon-movie" />
                <h2>Movies You'll Love</h2>
              </div>
            </div>
            
            <div className="movie-recommendations-grid">
              {movies.length > 0 ? (
                movies.map(movie => (
                  <Link to={`/movie/${movie.tmdbId || movie._id}`} key={movie.tmdbId || movie._id} className="movie-card-rec glass-panel">
                    <div className="movie-poster-wrapper">
                      <img src={movie.posterUrl || 'https://via.placeholder.com/300x450'} alt={movie.title} />
                      <div className="movie-badge">
                        <Star size={12} fill="currentColor" />
                        <span>{movie.similarity ? `${Math.round(movie.similarity * 100)}% Match` : movie.rating}</span>
                      </div>
                    </div>
                    <div className="movie-info-rec">
                      <h3>{movie.title}</h3>
                      <p className="movie-meta">{movie.releaseYear} • {movie.genre}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state glass-panel">
                  <p>Watch and rate more movies to get better recommendations!</p>
                </div>
              )}
            </div>
          </section>

          <section className="recommendations-section">
            <div className="section-header">
              <div className="section-title">
                <Users size={20} className="section-icon-critic" />
                <h2>Critics Like You</h2>
              </div>
              <Link to="/critics" className="view-all">View All Critics <ArrowRight size={16} /></Link>
            </div>

            <div className="critic-suggestions-list">
              {critics.length > 0 ? (
                critics.map(critic => (
                  <div key={critic._id} className="critic-card-rec glass-panel">
                    <img src={critic.avatarUrl} alt={critic.username} className="critic-avatar-rec" />
                    <div className="critic-info-rec">
                      <div className="critic-name-row">
                        <h3>{critic.username}</h3>
                        <CheckCircle2 size={14} className="verified-icon" />
                      </div>
                      <p className="critic-match-text">Matches your taste in movies</p>
                      <button 
                        onClick={() => handleFollow(critic._id)} 
                        className={`btn btn-sm ${critic.isFollowing ? 'btn-glass' : 'btn-outline'}`}
                      >
                        {critic.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state glass-panel">
                  <p>No critic suggestions yet. Rate some movies to find your perfect critic!</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
