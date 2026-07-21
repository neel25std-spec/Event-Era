import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login before protected actions.
 * Preserves the intended destination in location state for post-login redirect.
 */
export default function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToLogin = useCallback(
    (from = location) => {
      navigate('/login', { state: { from } });
    },
    [navigate, location]
  );

  const requireAuth = useCallback(
    (action) => {
      if (!user) {
        redirectToLogin();
        return false;
      }
      if (typeof action === 'function') {
        action();
      }
      return true;
    },
    [user, redirectToLogin]
  );

  const requireAuthNavigate = useCallback(
    (to) => {
      if (!user) {
        redirectToLogin({ pathname: to });
        return false;
      }
      navigate(to);
      return true;
    },
    [user, navigate, redirectToLogin]
  );

  return { user, requireAuth, requireAuthNavigate, redirectToLogin };
}
