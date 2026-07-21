import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is not logged in or we don't have a recovery token in hash, we might not be able to reset.
    // Supabase automatically logs the user in with the recovery token when they click the link,
    // so `session` should be populated.
    const hash = window.location.hash;
    if (!session && !hash.includes('type=recovery') && !hash.includes('access_token')) {
      toast.error('Invalid or missing password reset token.');
      navigate('/login');
    }
  }, [session, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      toast.success('Password updated successfully! 🎉');
      navigate('/login');
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      style={{
        maxWidth: '400px',
        margin: '60px auto',
        padding: '30px',
        background: 'white',
        borderRadius: '8px',
        border: '4px solid #1a2638',
        boxShadow: '6px 6px 0px #1a2638'
      }}
    >
      <h1 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.75rem',
          fontWeight: 900,
          color: '#1a2638',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}
      >
        Reset Password 🔑
      </h1>
      <p style={{ marginBottom: '20px', color: '#4b5563', fontFamily: 'var(--font-mono)' }}>
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', 
                padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ 
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', 
                padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7
              }}
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={loading || !password || !confirmPassword}
          style={{ marginTop: '10px' }}
        >
          {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
        </button>
      </form>
    </div>
  );
}
