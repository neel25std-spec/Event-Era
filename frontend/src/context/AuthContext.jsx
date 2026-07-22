import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { syncAuthProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!supabase) {
      // Mock mode auth check
      const mockUser = localStorage.getItem('mock_user');
      const sessionAlive = sessionStorage.getItem('session_active');
      
      if (mockUser && sessionAlive) {
        setUser(JSON.parse(mockUser));
      } else if (mockUser && !sessionAlive) {
        // Browser was closed and reopened — auto sign out
        localStorage.removeItem('mock_user');
        localStorage.removeItem('access_token');
        setUser(null);
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      const sessionAlive = sessionStorage.getItem('session_active');
      
      if (s && !sessionAlive) {
        // Browser was closed and reopened — auto sign out
        await supabase.auth.signOut();
        localStorage.removeItem('access_token');
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.access_token) {
        localStorage.setItem('access_token', s.access_token);
        sessionStorage.setItem('session_active', 'true');
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.access_token) {
        localStorage.setItem('access_token', s.access_token);
        sessionStorage.setItem('session_active', 'true');
        
        if (_event === 'SIGNED_IN') {
          syncAuthProfile().catch(err => {
            console.error('Failed to sync profile after login:', err);
          });
          
          // Global navigation
          const from = location.state?.from?.pathname || '/';
          if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
            navigate(from, { replace: true });
          }
        }
      } else {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('session_active');
        
        if (_event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email, password) {
    if (!supabase) {
      // Mock signup success with localStorage persistence
      const normalizedEmail = email.trim().toLowerCase();
      const users = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
      
      if (users[normalizedEmail]) {
        return { data: { user: null }, error: new Error('An account with this email already exists.') };
      }
      
      const id = 'mock-id-' + Math.random().toString(36).substring(2, 11);
      users[normalizedEmail] = { id, password };
      localStorage.setItem('mock_users_db', JSON.stringify(users));

      const newUser = { id, email: normalizedEmail };
      setUser(newUser);
      localStorage.setItem('mock_user', JSON.stringify(newUser));
      localStorage.setItem('access_token', btoa(JSON.stringify(newUser)));
      sessionStorage.setItem('session_active', 'true');
      return { data: { user: newUser }, error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  async function signIn(email, password) {
    if (!supabase) {
      // Mock signin validation against localStorage persistence
      const normalizedEmail = email.trim().toLowerCase();
      const users = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
      const existingUser = users[normalizedEmail];
      
      if (!existingUser) {
        return { data: { user: null }, error: new Error('No account found with this email. Please sign up first.') };
      }
      
      if (existingUser.password !== password) {
        return { data: { user: null }, error: new Error('Invalid password. Please try again.') };
      }

      const loggedInUser = { id: existingUser.id, email: normalizedEmail };
      setUser(loggedInUser);
      localStorage.setItem('mock_user', JSON.stringify(loggedInUser));
      localStorage.setItem('access_token', btoa(JSON.stringify(loggedInUser)));
      sessionStorage.setItem('session_active', 'true');
      return { data: { user: loggedInUser }, error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signInWithGoogle() {
    if (!supabase) {
      return { data: null, error: new Error('Google login requires Supabase to be configured.') };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { data, error };
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      localStorage.removeItem('mock_user');
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('session_active');
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('session_active');
  }

  async function forgotPassword(email) {
    if (!supabase) {
      return { data: null, error: null };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }

  async function updatePassword(password) {
    if (!supabase) {
      return { data: null, error: null };
    }
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  }

  const value = { user, session, loading, signUp, signIn, signInWithGoogle, signOut, forgotPassword, updatePassword, isConfigured: !!supabase };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
