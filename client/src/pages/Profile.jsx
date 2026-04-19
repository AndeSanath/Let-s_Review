import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Bookmark, CheckCircle, Settings, LogOut, Grid, List as ListIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('watchlist');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/user/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await axios.post('/api/admin/sync-media');
      setSyncMessage({ type: 'success', text: res.data.message });
      // Refresh profile to see any updates if needed (though posters are movie-level)
      window.location.reload(); // Quick way to refresh all images
    } catch (err) {
      setSyncMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to sync with TMDB' 
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!profile) return <div className="error-container">Failed to load profile.</div>;

  const currentList = activeTab === 'watchlist' ? profile.watchlist : profile.watched;

  return (
    <div className="profile-page animate-fade-in">
      {/* ── PROFILE HEADER ── */}
      <div className="profile-header glass-panel">
        <div className="profile-info">
          <div className="profile-avatar-wrapper">
            <img src={profile.avatarUrl} alt={profile.username} className="profile-avatar" />
            <div className="role-badge">{profile.role}</div>
          </div>
          <div className="profile-details">
            <h1>{profile.username}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{profile.watchlist?.length || 0}</span>
                <span className="stat-label">Watchlist</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{profile.watched?.length || 0}</span>
                <span className="stat-label">Watched</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{profile.following?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button 
            className="btn btn-primary btn-sm sync-btn" 
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> 
            {syncing ? 'Syncing...' : 'Sync with TMDB'}
          </button>
          {syncMessage && (
            <div className={`sync-status ${syncMessage.type}`}>
              {syncMessage.type === 'error' && <AlertCircle size={14} />}
              {syncMessage.text}
            </div>
          )}
          <button className="btn btn-secondary btn-sm"><Settings size={16} /> Edit Profile</button>
          <button onClick={logout} className="btn btn-outline btn-sm logout-btn-profile"><LogOut size={16} /> Logout</button>
        </div>
      </div>

      {/* ── LIST TABS ── */}
      <div className="list-container">
        <div className="list-tabs">
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <Bookmark size={20} />
            Watchlist
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
            onClick={() => setActiveTab('watched')}
          >
            <CheckCircle size={20} />
            Watched
          </button>
        </div>

        {/* ── LIST CONTENT ── */}
        <div className="list-content animate-fade-in" key={activeTab}>
          {currentList && currentList.length > 0 ? (
            <div className="movies-grid">
              {currentList.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <div className="empty-icon">
                {activeTab === 'watchlist' ? <Bookmark size={48} /> : <CheckCircle size={48} />}
              </div>
              <h3>Nothing here yet</h3>
              <p>
                {activeTab === 'watchlist' 
                  ? "You haven't added any movies to your watchlist." 
                  : "You haven't marked any movies as watched."}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/explore')}
              >
                Browse Movies
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
