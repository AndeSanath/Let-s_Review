import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Play, Users, Zap, Star, ShieldCheck, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trendingMovies, setTrendingMovies] = useState([]);

  useEffect(() => {
    if (user) {
      navigate('/explore');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('/api/movies?category=Trending');
        setTrendingMovies(res.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching trending movies:', err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="landing-container">
      {/* ── HERO SECTION ── */}
      <section className="landing-hero">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content animate-fade-in">
          <div className="hero-badge animate-slide-in">
            <SparklesIcon /> <span>Discover the Magic of Cinema</span>
          </div>
          <h1 className="hero-title">
            Review. Rate. <br />
            <span className="text-gradient">Repeat.</span>
          </h1>
          <p className="hero-description">
            Join the ultimate community for movie lovers. Follow top critics, 
            track your watchlist, and share your cinematic journey with the world.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-large">
              Get Started for Free <ChevronRight size={20} />
            </Link>
            <Link to="/explore" className="btn btn-glass btn-large">
              Explore Movies <Play size={18} fill="currentColor" />
            </Link>
          </div>
        </div>
        
        {/* Floating elements for visual depth */}
        <div className="floating-card c1 animate-float">🎬</div>
        <div className="floating-card c2 animate-float-delayed">⭐</div>
        <div className="floating-card c3 animate-float">🍿</div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="landing-features">
        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">Why LetsReview?</h2>
            <p className="section-subtitle">Experience movies like never before with our social-first features.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card glass-panel animate-fade-in">
              <div className="feature-icon-wrapper p-bg">
                <Users size={28} />
              </div>
              <h3>Follow the Pros</h3>
              <p>Get insights from verified movie critics and follow their latest takes on trending releases.</p>
            </div>
            
            <div className="feature-card glass-panel animate-fade-in">
              <div className="feature-icon-wrapper b-bg">
                <Zap size={28} />
              </div>
              <h3>Live Social Feed</h3>
              <p>See what the world is watching right now. Real-time updates on reviews and favorites from the community.</p>
            </div>
            
            <div className="feature-card glass-panel animate-fade-in">
              <div className="feature-icon-wrapper g-bg">
                <ShieldCheck size={28} />
              </div>
              <h3>Verified Ratings</h3>
              <p>Our unique algorithm ensures reviews are authentic and helpful, so you always know what's worth watching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING PREVIEW ── */}
      <section className="landing-preview">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Trending Right Now</h2>
              <p className="section-subtitle">Catch up with the movies everyone is talking about.</p>
            </div>
            <Link to="/explore" className="btn btn-link">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="preview-grid grid-cols-5">
            {trendingMovies.length > 0 ? (
              trendingMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))
            ) : (
              // Skeleton cards for loading
              [...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-card glass-panel shimmer" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="landing-final-cta">
        <div className="cta-gradient-bg"></div>
        <div className="cta-content text-center">
          <h2>Ready to Join the Conversation?</h2>
          <p>Create your profile today and start tracking your movie journey.</p>
          <Link to="/signup" className="btn btn-primary btn-xlarge">
            Create Free Account
          </Link>
        </div>
      </section>
      
      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <TrendingUp className="text-accent" /> LetsReview
          </div>
          <p>&copy; 2026 LetsReview. Built for the love of cinema.</p>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
