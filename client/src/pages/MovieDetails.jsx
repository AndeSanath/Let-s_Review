import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageCircle, Send, Play, Users, Bookmark, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MovieDetails.css';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audience'); // 'audience' or 'critic'
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, reviewsRes] = await Promise.all([
          axios.get(`/api/movies/${id}`),
          axios.get(`/api/reviews?movieId=${id}`)
        ]);
        setMovie(movieRes.data);
        setReviews(reviewsRes.data);

        if (user) {
          const profileRes = await axios.get('/api/user/profile');
          setIsInWatchlist(profileRes.data.watchlist.some(m => String(m._id) === String(id)));
          setIsWatched(profileRes.data.watched.some(m => String(m._id) === String(id)));
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const toggleWatchlist = async () => {
    try {
      const res = await axios.post('/api/user/watchlist/toggle', { movieId: id });
      setIsInWatchlist(res.data.watchlist.some(wId => String(wId) === String(id)));
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  const toggleWatched = async () => {
    try {
      const res = await axios.post('/api/user/watched/toggle', { movieId: id });
      setIsWatched(res.data.watched.some(wId => String(wId) === String(id)));
    } catch (err) {
      console.error('Watched toggle error:', err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to post a review');
    if (!newReview.comment) return;
    
    setSubmitting(true);
    try {
      const res = await axios.post('/api/reviews', {
        ...newReview,
        movieId: id,
        movieTitle: movie.title
      });
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!movie) return <div className="text-secondary text-center">Movie not found</div>;

  const criticReviews = reviews.filter(r => r.userRole === 'critic');
  const audienceReviews = reviews.filter(r => r.userRole === 'user');
  const displayedReviews = activeTab === 'critic' ? criticReviews : audienceReviews;

  return (
    <div className="movie-details-page animate-fade-in">
      <div className="movie-header glass-panel" style={{ backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})` }}>
        <div className="header-overlay">
          <img src={movie.posterUrl} alt={movie.title} className="detail-poster" />
          <div className="header-info">
            <span className="badge">{movie.category}</span>
            <h1>{movie.title} ({movie.releaseYear})</h1>
            <div className="tags">
              <span className="badge">{movie.genre}</span>
              <span className="badge">{movie.language}</span>
              <span className="badge">{movie.platform}</span>
            </div>
            <p className="synopsis">{movie.synopsis}</p>
            <div className="rating-box">
              <Star size={24} fill="var(--star-color)" stroke="none" />
              <span className="rating-score">{movie.rating ? movie.rating.toFixed(1) : 'NR'}</span>
              <span className="rating-count">({reviews.length} Reviews)</span>
            </div>
            {movie.trailerUrl && (
              <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glass" style={{ marginTop: '1.5rem' }}>
                <Play size={18} fill="currentColor" /> Watch Trailer
              </a>
            )}
            
            {user && (
              <div className="user-actions-row">
                <button 
                  className={`btn ${isInWatchlist ? 'btn-primary' : 'btn-glass'}`}
                  onClick={toggleWatchlist}
                >
                  <Bookmark size={18} fill={isInWatchlist ? 'currentColor' : 'none'} />
                  {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
                </button>
                <button 
                  className={`btn ${isWatched ? 'btn-success' : 'btn-glass'}`}
                  onClick={toggleWatched}
                >
                  <CheckCircle size={18} />
                  {isWatched ? 'Watched' : 'Mark Watched'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section grid grid-cols-2">
        <div className="write-review-container">
          {user ? (
            <div className="write-review glass-panel">
              <h2><MessageCircle size={24} className="icon"/> Write a Review</h2>
              <form onSubmit={submitReview}>
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={28} 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        fill={star <= newReview.rating ? 'var(--star-color)' : 'transparent'}
                        stroke={star <= newReview.rating ? 'var(--star-color)' : 'var(--text-secondary)'}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Your Experience</label>
                  <textarea 
                    placeholder="What did you think of the movie?" 
                    rows="4"
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : <><Send size={18} /> Post Review</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <h3>Want to share your review?</h3>
              <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Login to post your rating and experience.</p>
              <Link to="/login" className="btn btn-primary">Login Now</Link>
            </div>
          )}
        </div>

        <div className="reviews-display">
          <div className="reviews-tabs">
            <button 
              className={`tab ${activeTab === 'audience' ? 'active' : ''}`}
              onClick={() => setActiveTab('audience')}
            >
              Audience ({audienceReviews.length})
            </button>
            <button 
              className={`tab ${activeTab === 'critic' ? 'active' : ''}`}
              onClick={() => setActiveTab('critic')}
            >
              <Users size={16} /> Critics ({criticReviews.length})
            </button>
          </div>

          <div className="reviews-scroll">
            {displayedReviews.length === 0 ? (
              <p className="text-secondary" style={{ padding: '2rem' }}>No reviews found for this section.</p>
            ) : (
              displayedReviews.map(review => (
                <div key={review._id} className={`review-card glass-panel animate-slide-in ${review.userRole === 'critic' ? 'critic-review' : ''}`}>
                  <div className="review-header">
                    <img src={review.avatarUrl} alt={review.username} className="reviewer-avatar" />
                    <div>
                      <div className="reviewer-name">
                        {review.username} 
                        {review.userRole === 'critic' && <span className="critic-badge">EXPERT</span>}
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} fill={i < review.rating ? 'var(--star-color)' : 'transparent'} stroke={i < review.rating ? 'var(--star-color)' : 'var(--text-secondary)'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
