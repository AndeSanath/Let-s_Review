import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Star } from 'lucide-react';
import './LiveReviewToast.css';

const socket = io('/');

export default function LiveReviewToast() {
  const [toastOptions, setToastOptions] = useState(null);

  useEffect(() => {
    const handleNewReview = (review) => {
      setToastOptions(review);
      // Auto hide after 6s (matches CSS animation)
      setTimeout(() => setToastOptions(null), 6000);
    };

    socket.on('new_review', handleNewReview);
    return () => socket.off('new_review', handleNewReview);
  }, []);

  if (!toastOptions) return null;

  return (
    <div className="live-review-toast glass-panel">
      <div className="toast-header">
        <img src={toastOptions.avatarUrl} alt="avatar" className="toast-avatar" />
        <div>
          <p className="toast-user"><b>{toastOptions.username}</b> reviewed <span>{toastOptions.movieTitle}</span></p>
          <div className="toast-rating">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < toastOptions.rating ? 'var(--star-color)' : 'transparent'} stroke={i < toastOptions.rating ? 'var(--star-color)' : 'var(--text-secondary)'} />
            ))}
          </div>
        </div>
      </div>
      <p className="toast-comment">"{toastOptions.comment}"</p>
    </div>
  );
}
