import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, User, Play, MonitorPlay, Sun, Moon, LogOut, Users, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand text-glow">
          <Film className="brand-icon" />
          <span>Lets Review</span>
        </Link>
        
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/explore" className="nav-link">Home</Link>
          <Link to="/category/Trending" className="nav-link"><Play size={16}/> Trending</Link>
          <Link to="/category/OTT" className="nav-link"><MonitorPlay size={16}/> OTT</Link>
          <Link to="/category/Theatre" className="nav-link"><Film size={16}/> Theatre</Link>
          <Link to="/critics" className="nav-link"><Users size={16}/> Critics</Link>
          {user && <Link to="/recommendations" className="nav-link"><Sparkles size={16}/> For You</Link>}
          {user && <Link to="/profile" className="nav-link">Profile</Link>}
        </div>

        <div className="navbar-actions">
          <div className="search-bar desktop-search">
            <Search size={18} className="search-icon"/>
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="user-profile">
              <Link to="/profile">
                <img src={user.avatarUrl} alt={user.username} className="nav-avatar" title="View Profile" />
              </Link>
              <button onClick={logout} className="logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm login-desktop">Login</Link>
          )}

          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
