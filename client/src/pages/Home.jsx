import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Star, TrendingUp, Sparkles, MonitorPlay, Clapperboard, Zap, ChevronRight } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './Home.css';

const socket = io('/');

const ACTIVITY_TEMPLATES = [
  (u, m) => `${u} just reviewed "${m}"`,
  (u, m) => `${u} rated "${m}" ⭐⭐⭐⭐⭐`,
  (u, m) => `${u} added "${m}" to favorites`,
  (u, m) => `${u} just watched "${m}"`,
];

const FAKE_USERS = ['Arjun_K', 'Priya_M', 'FilmNerd23', 'ScreenJunkie', 'CinemaFan', 'MovieBuff99', 'RaviReviews', 'SnehaWatches', 'DeepCineplex', 'KiranCritic'];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [ottMovies, setOttMovies] = useState([]);
  const [theatreMovies, setTheatreMovies] = useState([]);
  const [liveActivity, setLiveActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const activityIdRef = useRef(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, n, o, th] = await Promise.all([
          axios.get('/api/movies?category=Trending'),
          axios.get('/api/movies?category=New'),
          axios.get('/api/movies?category=OTT'),
          axios.get('/api/movies?category=Theatre'),
        ]);
        setTrending(t.data);
        setNewReleases(n.data);
        setOttMovies(o.data);
        setTheatreMovies(th.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Hero auto-cycle
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(i => (i + 1) % trending.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trending]);

  // Simulated live activity feed
  useEffect(() => {
    const allMovieTitles = [...trending, ...newReleases, ...ottMovies, ...theatreMovies].map(m => m.title);
    if (allMovieTitles.length === 0) return;

    const addActivity = () => {
      const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      const movie = allMovieTitles[Math.floor(Math.random() * allMovieTitles.length)];
      const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
      const id = activityIdRef.current++;
      setLiveActivity(prev => [{ id, text: template(user, movie), time: 'just now' }, ...prev.slice(0, 9)]);
    };

    addActivity();
    const interval = setInterval(addActivity, 3500);
    return () => clearInterval(interval);
  }, [trending, newReleases, ottMovies, theatreMovies]);

  // Real review socket
  useEffect(() => {
    socket.on('new_review', (review) => {
      const id = activityIdRef.current++;
      setLiveActivity(prev => [
        { id, text: `${review.username} reviewed "${review.movieTitle}"`, time: 'just now', highlight: true },
        ...prev.slice(0, 9)
      ]);
    });
    return () => socket.off('new_review');
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const heroMovie = trending[heroIndex] || newReleases[0];
  const allCategories = [
    { label: 'Trending', icon: <TrendingUp size={18} />, movies: trending, path: '/category/Trending' },
    { label: 'New Releases', icon: <Sparkles size={18} />, movies: newReleases, path: '/category/New' },
    { label: 'On OTT', icon: <MonitorPlay size={18} />, movies: ottMovies, path: '/category/OTT' },
    { label: 'In Theatres', icon: <Clapperboard size={18} />, movies: theatreMovies, path: '/category/Theatre' },
  ];

  return (
    <div className="home-page animate-fade-in">

      {/* ── HERO ── */}
      {heroMovie && (
        <section className="hero-section" key={heroMovie._id} style={{ backgroundImage: `url(${heroMovie.bannerUrl || heroMovie.posterUrl})` }}>
          <div className="hero-overlay">
            <div className="hero-content">
              <span className="badge">🔥 Trending Now</span>
              <h1>{heroMovie.title}</h1>
              <p className="hero-synopsis">{heroMovie.synopsis}</p>
              <div className="hero-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20}
                    fill={i < Math.round(heroMovie.rating) ? 'var(--star-color)' : 'transparent'}
                    stroke={i < Math.round(heroMovie.rating) ? 'var(--star-color)' : 'rgba(255,255,255,0.3)'}
                  />
                ))}
                <span className="hero-rating-score">{heroMovie.rating?.toFixed(1)}</span>
              </div>
              <div className="hero-actions">
                <Link to={`/movie/${heroMovie._id || heroMovie.tmdbId}`} className="btn btn-primary">View Movie</Link>
                <span className="hero-genre-tag">{heroMovie.genre} · {heroMovie.language}</span>
              </div>
            </div>
          </div>
          <div className="hero-dots">
            {trending.map((_, i) => (
              <button key={i} className={`dot ${i === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(i)} />
            ))}
          </div>
        </section>
      )}

      {/* ── LIVE ACTIVITY TICKER ── */}
      <div className="live-ticker glass-panel">
        <span className="ticker-label"><Zap size={14} fill="var(--accent-color)" stroke="none" /> LIVE</span>
        <div className="ticker-scroll">
          <div className="ticker-inner">
            {liveActivity.slice(0, 5).map(a => (
              <span key={a.id} className={`ticker-item ${a.highlight ? 'highlight' : ''}`}>{a.text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOVIE SECTIONS ── */}
      {allCategories.map(({ label, icon, movies, path }) =>
        movies.length > 0 && (
          <section className="movie-section" key={label}>
            <div className="section-header">
              <h2 className="section-title">{icon} {label}</h2>
              <Link to={path} className="see-all-btn">See All <ChevronRight size={16} /></Link>
            </div>
            <div className="movies-scroll-row">
              {movies.slice(0, 5).map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )
      )}

      {/* ── LIVE ACTIVITY FEED ── */}
      <section className="activity-section glass-panel">
        <h2 className="section-title"><Zap size={22} fill="var(--accent-color)" stroke="none" /> Live Activity</h2>
        <ul className="activity-list">
          {liveActivity.map(a => (
            <li key={a.id} className={`activity-item animate-slide-in ${a.highlight ? 'highlight' : ''}`}>
              <span className="pulse-dot" />
              <span className="activity-text">{a.text}</span>
              <span className="activity-time">{a.time}</span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
