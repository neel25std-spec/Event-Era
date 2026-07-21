import supabase from '../config/supabase.js';

/**
 * Middleware that verifies a Supabase JWT from the Authorization header.
 * On success, attaches `req.user` with `{ id, email }`.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.split(' ')[1];

  if (!supabase) {
    // Mock mode — skip verification, decode user from base64 token if possible
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      req.user = { id: decoded.id, email: decoded.email };
    } catch (err) {
      req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'mock@user.dev' };
    }
    return next();
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional auth — attaches req.user if token present, but does not reject
 * unauthenticated requests.
 */
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = header.split(' ')[1];

  if (!supabase) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      req.user = { id: decoded.id, email: decoded.email };
    } catch (err) {
      req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'mock@user.dev' };
    }
    return next();
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    req.user = user ? { id: user.id, email: user.email } : null;
  } catch {
    req.user = null;
  }

  next();
}
