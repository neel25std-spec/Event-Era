import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="events-loading" style={{ margin: '80px auto' }}>
        <div className="spinner" />
        <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
          VERIFYING SESSION...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save the current path to redirect back afterwards
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
