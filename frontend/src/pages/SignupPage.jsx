import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;
      
      if (isConfigured) {
        if (data?.session) {
          toast.success('Registration successful! Welcome aboard.');
          // Global onAuthStateChange will handle navigation to home
        } else {
          toast.success('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        }
      } else {
        toast.success('Mock Registration success! 👋');
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
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
      id="signup-page"
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
            Create Account
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
            JOIN THE FREE EVENT COMMUNITY
          </p>
        </div>

        <form onSubmit={handleSignup} className="modal-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">Email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="signup-confirm-password" className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
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

          {/* Submit */}
          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'REGISTERING...' : 'SIGN UP 🎉'}
          </button>
        </form>

        <GoogleAuthButton />

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: '#64748b' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-primary-500)', fontWeight: 'bold', textDecoration: 'underline' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
