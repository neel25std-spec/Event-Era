import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { signIn, forgotPassword, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast.success('Logged in successfully! 👋');
      
      if (!isConfigured) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email first.');
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await forgotPassword(email);
      if (error) throw error;
      toast.success('Password reset email sent! (If account exists)');
      setShowForgot(false);
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.message || 'Failed to send reset email.');
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 250px)',
        padding: '40px 0'
      }}
      id="login-page"
    >
      <div 
        className="modal" 
        style={{
          position: 'relative',
          animation: 'none',
          boxShadow: '8px 8px 0px #1a2638',
          maxWidth: '460px',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '2rem', marginBottom: '8px' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
            {!isConfigured ? '⚡ MOCK AUTHENTICATION ACTIVE' : 'LOG IN TO YOUR ACCOUNT'}
          </p>
        </div>

        {!isConfigured && (
          <div 
            style={{
              background: '#f0f7ff',
              border: '2px solid var(--color-primary-500)',
              borderRadius: '4px',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              color: 'var(--color-primary-500)',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            ℹ️ Supabase credentials not set (Mock Mode). You must sign up first before signing in.
          </div>
        )}

        <form onSubmit={handleLogin} className="modal-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
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
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {!showForgot && (
            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowForgot(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary-500)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {showForgot && (
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '4px', border: '2px solid #1a2638', marginBottom: '15px' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: '#4b5563', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                Enter your email above and we'll send a reset link.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="btn btn--primary"
                  style={{ flexGrow: 1, padding: '8px' }}
                  disabled={forgotLoading || !email}
                >
                  {forgotLoading ? 'SENDING...' : 'SEND RESET LINK 📧'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="btn btn--ghost"
                  style={{ padding: '8px' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'SIGN IN 🚀'}
          </button>
        </form>

        <GoogleAuthButton />

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: '#64748b' }}>Don't have an account? </span>
          <Link to="/signup" style={{ color: 'var(--color-primary-500)', fontWeight: 'bold', textDecoration: 'underline' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
