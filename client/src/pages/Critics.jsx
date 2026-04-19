import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Star, UserPlus, UserCheck } from 'lucide-react';
import './Critics.css';

export default function Critics() {
  const [critics, setCritics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchCritics = async () => {
      try {
        const res = await axios.get('/api/critics');
        setCritics(res.data);
        if (user) {
          // This would ideally come from a user profile fetch
          setFollowing(user.following || []);
        }
      } catch (err) {
        console.error('Fetch critics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCritics();
  }, [user]);

  const toggleFollow = async (criticId) => {
    if (!user) {
      alert('Please login to follow critics');
      return;
    }
    try {
      const res = await axios.post(`/api/critics/${criticId}/follow`);
      setFollowing(res.data.following);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="critics-page animate-fade-in">
      <div className="section-header">
        <h1><Users size={32} /> Professional Critics</h1>
        <p className="text-secondary">Follow your favorite critics for expert insights.</p>
      </div>

      <div className="grid grid-cols-3" style={{ marginTop: '3rem' }}>
        {critics.map(critic => (
          <div key={critic._id} className="critic-card glass-panel">
            <img src={critic.avatarUrl} alt={critic.username} className="critic-avatar" />
            <h3>{critic.username}</h3>
            <div className="critic-meta">
              <Star size={16} fill="var(--star-color)" stroke="none" />
              <span>Professional Critic</span>
            </div>
            <button 
              className={`btn ${following.includes(critic._id) ? 'btn-glass' : 'btn-primary'} w-full`}
              onClick={() => toggleFollow(critic._id)}
              style={{ marginTop: '1.5rem' }}
            >
              {following.includes(critic._id) ? (
                <><UserCheck size={18} /> Following</>
              ) : (
                <><UserPlus size={18} /> Follow</>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {critics.length === 0 && (
        <p className="text-secondary text-center">No professional critics found.</p>
      )}
    </div>
  );
}
