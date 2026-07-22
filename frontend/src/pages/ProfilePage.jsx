import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, fetchProfile, updateProfile, uploadAvatar, deleteAvatar } from '../services/api';
import EventCard from '../components/EventCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('joined'); // joined vs created
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', full_name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [eventsData, profileData] = await Promise.all([
          fetchUserProfile(),
          fetchProfile().catch(() => null)
        ]);
        setCreatedEvents(eventsData.createdEvents);
        setJoinedEvents(eventsData.joinedEvents);
        if (profileData) {
          setProfile(profileData);
          setEditForm({
            username: profileData.username || '',
            full_name: profileData.full_name || '',
            bio: profileData.bio || ''
          });
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="events-loading" style={{ margin: '80px auto' }}>
        <div className="spinner" />
        <p>LOADING PROFILE DATA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-error" style={{ margin: '80px auto' }}>
        <p>{error}</p>
      </div>
    );
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleProfilePicUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvatarLoading(true);
    try {
      const res = await uploadAvatar(file);
      setProfile(res.profile);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleProfilePicDelete() {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setAvatarLoading(true);
    try {
      const res = await deleteAvatar();
      setProfile(res.profile);
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error('Failed to remove profile picture');
    } finally {
      setAvatarLoading(false);
    }
  }

  const displayedEvents = activeTab === 'joined' ? joinedEvents : createdEvents;

  return (
    <div className="profile-page" id="profile-details-page" style={{ padding: '20px 0 60px' }}>
      {/* Profile Header Card */}
      <div 
        style={{
          background: '#ffffff',
          border: '3px solid #1a2638',
          borderRadius: '4px',
          boxShadow: '6px 6px 0px #1a2638',
          padding: '30px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        {/* Hidden file input for profile picture */}
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/webp" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleProfilePicUpload}
        />
        <div 
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'var(--color-yellow-500)',
            border: '3px solid #1a2638',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
          title="Click to change profile picture"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '👤'
          )}
          {/* Camera overlay on hover */}
          <div 
            className="profile-pic-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <span style={{ fontSize: '1.5rem' }}>📷</span>
          </div>
          {avatarLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.8rem', color: '#1a2638', marginBottom: '4px' }}>
                {profile?.full_name || 'User Account'}
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>
                @{profile?.username || user?.email?.split('@')[0]}
              </p>
            </div>
            
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn--outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                EDIT PROFILE
              </button>
            )}
          </div>
          
          {!isEditing && profile?.bio && (
            <p style={{ marginTop: '12px', color: '#1a2638', lineHeight: '1.5' }}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '4px', border: '2px solid #1a2638', marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginBottom: '20px' }}>Edit Profile</h3>
          
          {/* Profile Picture Section */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-yellow-500)',
                border: '2px solid #1a2638',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '👤'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Profile Picture</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn--outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} disabled={avatarLoading}>
                  CHANGE PHOTO
                </button>
                {profile?.avatar_url && (
                  <button type="button" onClick={handleProfilePicDelete} className="btn btn--ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} disabled={avatarLoading}>
                    REMOVE
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} minLength={2} maxLength={50} required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} maxLength={100} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input form-textarea" rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} maxLength={500} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
              <button type="button" className="btn btn--ghost" onClick={() => { setIsEditing(false); setEditForm({ username: profile?.username || '', full_name: profile?.full_name || '', bio: profile?.bio || '' }); }}>CANCEL</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2.5px solid #1a2638',
          paddingBottom: '2px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('joined')}
          style={{
            padding: '12px 24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            border: '2.5px solid #1a2638',
            borderBottom: 'none',
            borderRadius: '4px 4px 0 0',
            background: activeTab === 'joined' ? 'var(--color-yellow-500)' : '#ffffff',
            color: '#1a2638',
            cursor: 'pointer',
            position: 'relative',
            bottom: activeTab === 'joined' ? '-4px' : '0'
          }}
        >
          Joined Events ({joinedEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('created')}
          style={{
            padding: '12px 24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            border: '2.5px solid #1a2638',
            borderBottom: 'none',
            borderRadius: '4px 4px 0 0',
            background: activeTab === 'created' ? 'var(--color-yellow-500)' : '#ffffff',
            color: '#1a2638',
            cursor: 'pointer',
            position: 'relative',
            bottom: activeTab === 'created' ? '-4px' : '0'
          }}
        >
          Created Events ({createdEvents.length})
        </button>
      </div>

      {/* List content */}
      {displayedEvents.length === 0 ? (
        <div 
          style={{
            background: '#ffffff',
            border: '2px dashed #1a2638',
            borderRadius: '4px',
            padding: '60px 20px',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '14px' }}>🎈</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '8px' }}>
            No events to show
          </h3>
          <p style={{ color: '#64748b' }}>
            {activeTab === 'joined' 
              ? 'You haven’t joined any events yet. Head over to discover page to find some!' 
              : 'You haven’t created any events yet.'}
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
