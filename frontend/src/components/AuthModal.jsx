import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        onClose();
      } else {
        const { error: err } = await signUp(email, password);
        if (err) throw err;
        setSuccess('Check your email for a confirmation link!');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} id="auth-modal-backdrop">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        id="auth-modal"
      >
        {/* Close button */}
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
          id="auth-modal-close"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            type="button"
            className={`modal-tab ${mode === 'signin' ? 'modal-tab--active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`modal-tab ${mode === 'signup' ? 'modal-tab--active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">Email</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
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

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
