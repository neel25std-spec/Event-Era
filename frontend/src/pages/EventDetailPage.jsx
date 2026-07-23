import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventMap from '../components/EventMap';
import { useAuth } from '../context/AuthContext';
import useRequireAuth from '../hooks/useRequireAuth';
import {
  fetchEventById,
  joinEvent,
  leaveEvent,
  fetchComments,
  postComment,
  deleteComment,
  fetchUserProfile,
} from '../services/api';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  'free food': '🍕',
  entertainment: '🎤',
  community: '🤝',
};

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requireAuth, redirectToLogin } = useRequireAuth();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentPosting, setCommentPosting] = useState(false);
  const [error, setError] = useState(null);

  // Load event details, join status, and comments
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const eventData = await fetchEventById(id);
        setEvent(eventData);

        // Fetch comments
        try {
          const commentsData = await fetchComments(id);
          setComments(commentsData);
        } catch (err) {
          console.error('Failed to load comments:', err);
        } finally {
          setCommentsLoading(false);
        }

        // Check if joined
        if (user) {
          try {
            const profile = await fetchUserProfile();
            const joined = profile.joinedEvents.some((e) => e.id === id);
            setHasJoined(joined);
          } catch (err) {
            console.error('Failed to load join status:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load event details:', err);
        setError('Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  // Join or Leave event handler
  async function handleJoinToggle() {
    if (!requireAuth()) return;

    setActionLoading(true);
    try {
      if (hasJoined) {
        const res = await leaveEvent(id);
        setHasJoined(false);
        setEvent((prev) => ({ ...prev, attendees_count: res.attendees_count }));
        toast.success('You left the event.');
      } else {
        const res = await joinEvent(id);
        setHasJoined(false); // Wait, if joinEvent succeeds, setHasJoined to true
        setHasJoined(true);
        setEvent((prev) => ({ ...prev, attendees_count: res.attendees_count }));
        toast.success('You joined the event! 🎉');
      }
    } catch (err) {
      console.error('Failed to toggle join status:', err);
      const msg = err.response?.data?.error || 'Action failed.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // Post comment handler
  async function handlePostComment(e) {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!newComment.trim()) return;

    setCommentPosting(true);
    try {
      const res = await postComment(id, newComment);
      setComments([res, ...comments]); // Prepend since newest first
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error('Failed to post comment.');
    } finally {
      setCommentPosting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted.');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment.');
    }
  }

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner" />
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="detail-error" id="detail-error">
        <span className="detail-error-icon">😕</span>
        <h2>Event Not Found</h2>
        <p>{error}</p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate('/events')}
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: userTimeZone
  });
  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: userTimeZone
  });

  const spotsLeft = event.capacity
    ? event.capacity - event.attendees_count
    : null;

  return (
    <div className="detail-page" id="event-detail-page">
      {/* Back button */}
      <button
        type="button"
        className="detail-back"
        onClick={() => navigate('/events')}
        id="back-btn"
      >
        ← Back to Discover
      </button>

      <div className="detail-layout">
        {/* Main Details */}
        <div className="detail-main">
          {/* Header */}
          <div className="detail-header" style={{ marginBottom: '20px' }}>
            <span className="detail-type-badge">
              {TYPE_ICONS[event.event_type] || '📌'} {event.event_type}
            </span>
            {event.food_type && (
              <span className="detail-food-badge">🍽️ {event.food_type}</span>
            )}
          </div>

          <h1 className="detail-title" id="event-title">{event.title}</h1>

          {event.description && (
            <p className="detail-description">{event.description}</p>
          )}

          {/* Info grid */}
          <div className="detail-info-grid" style={{ marginBottom: '35px' }}>
            <div className="detail-info-item">
              <span className="detail-info-icon">📅</span>
              <div>
                <strong>{dateStr}</strong>
                <span>{timeStr}</span>
              </div>
            </div>

            {event.location_name && (
              <div className="detail-info-item">
                <span className="detail-info-icon">📍</span>
                <div>
                  <strong>{event.location_name}</strong>
                  <span>
                    {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {event.organizer_name && (
              <div className="detail-info-item">
                <span className="detail-info-icon">👤</span>
                <div>
                  <strong>{event.organizer_name}</strong>
                  {event.organizer_contact && (
                    <span>{event.organizer_contact}</span>
                  )}
                </div>
              </div>
            )}

            <div className="detail-info-item">
              <span className="detail-info-icon">👥</span>
              <div>
                <strong>{event.attendees_count} attending</strong>
                {spotsLeft !== null && (
                  <span className={spotsLeft <= 5 ? 'text-warning' : ''}>
                    {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Event is full'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div style={{ marginBottom: '40px' }}>
            <button
              type="button"
              className="btn btn--primary btn--lg btn--full"
              style={{
                backgroundColor: hasJoined ? 'var(--color-accent-500)' : 'var(--color-yellow-500)',
                color: hasJoined ? '#ffffff' : '#1a2638',
              }}
              disabled={actionLoading}
              onClick={handleJoinToggle}
            >
              {actionLoading
                ? 'PROCESSING...'
                : hasJoined
                ? 'LEAVE EVENT ❌'
                : 'JOIN EVENT 🎉'}
            </button>
          </div>

          {/* Comments Section */}
          <div 
            style={{
              borderTop: '2px dashed #1a2638',
              paddingTop: '30px'
            }}
            id="comments-section"
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.4rem', marginBottom: '20px' }}>
              Discussion 💬
            </h3>

            {commentsLoading ? (
              <div className="spinner" style={{ margin: '20px auto' }} />
            ) : comments.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                NO COMMENTS POSTED YET. BE THE FIRST!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {comments.map((c) => (
                  <div 
                    key={c.id} 
                    style={{
                      background: '#f8fafc',
                      border: '2px solid #1a2638',
                      borderRadius: '4px',
                      padding: '16px',
                      boxShadow: '3px 3px 0px #1a2638'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-500)' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-yellow-500)', border: '1px solid #1a2638', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.avatar_url ? <img src={c.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                        </div>
                        <span>{c.username || c.user_email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#64748b' }}>
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                        {user?.id === c.user_id && (
                          <button 
                            onClick={() => handleDeleteComment(c.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ color: '#1e293b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {c.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handlePostComment} className="event-form" style={{ padding: '24px', boxShadow: '4px 4px 0px #1a2638' }}>
                <div className="form-group">
                  <label htmlFor="comment-text" className="form-label">
                    Add a comment
                  </label>
                  <textarea
                    id="comment-text"
                    className="form-input form-textarea"
                    placeholder="Ask a question or share info..."
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn--primary"
                  style={{ width: 'fit-content' }}
                  disabled={commentPosting}
                >
                  {commentPosting ? 'Posting...' : 'Post Comment 💬'}
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="btn btn--primary btn--full"
                onClick={redirectToLogin}
              >
                Log In to Post a Comment 🔐
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Map */}
        <div className="detail-sidebar">
          <EventMap
            events={[event]}
            center={[event.latitude, event.longitude]}
            zoom={15}
            height="320px"
          />
        </div>
      </div>
    </div>
  );
}
