import supabase from '../config/supabase.js';

// ═══════════════════════════════════════════════════════════════════════
// AUTH CONTROLLER
// Handles signup, login, logout, forgot password, and reset password.
// Uses Supabase Auth under the hood via the service-role client.
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/signup
 * Creates a new user account and auto-creates a profile row.
 */
export async function signup(req, res) {
  try {
    const { email, password, username, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!supabase) {
      // Mock mode
      const mockUser = {
        id: crypto.randomUUID(),
        email: email.trim().toLowerCase(),
      };
      return res.status(201).json({
        message: 'User created successfully (mock mode)',
        user: mockUser,
      });
    }

    // Create user via Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm for backend-created users
    });

    if (error) {
      // Handle duplicate email
      if (error.message?.includes('already been registered')) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      throw error;
    }

    const user = data.user;

    // The database trigger `handle_new_user` will auto-create the profile,
    // but we also update it here if username/full_name were provided
    if (username || full_name) {
      const updates = {};
      if (username) updates.username = username.trim();
      if (full_name) updates.full_name = full_name.trim();

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
    }

    // Also ensure the legacy `users` table has an entry
    const { error: usersErr } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        username: username?.trim() || email.split('@')[0] + Math.floor(Math.random() * 1000),
      }, { onConflict: 'id' });

    if (usersErr) {
      console.error('Error upserting legacy users row:', usersErr);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

/**
 * POST /api/auth/login
 * Authenticates a user and returns session tokens.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!supabase) {
      // Mock mode
      const mockUser = { id: 'mock-id', email: email.trim().toLowerCase() };
      const mockToken = Buffer.from(JSON.stringify(mockUser)).toString('base64');
      return res.json({
        message: 'Login successful (mock mode)',
        session: { access_token: mockToken, user: mockUser },
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * POST /api/auth/logout
 * Invalidates the current session. Requires auth token.
 */
export async function logout(req, res) {
  try {
    if (!supabase) {
      return res.json({ message: 'Logged out (mock mode)' });
    }

    // Sign out the user server-side using the admin API
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      // Use admin to sign out user by token
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        await supabase.auth.admin.signOut(token);
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    // Still return success — the client should clear its tokens regardless
    res.json({ message: 'Logged out' });
  }
}

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email to the user.
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!supabase) {
      return res.json({ message: 'Password reset email sent (mock mode)' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password`,
      }
    );

    if (error) {
      console.error('Forgot password error:', error);
      // Don't reveal if email exists or not for security
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

/**
 * POST /api/auth/reset-password
 * Resets the user's password. Requires the access_token from the reset link.
 */
export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!supabase) {
      return res.json({ message: 'Password reset successful (mock mode)' });
    }

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Update the user's password via admin API
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) throw error;

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

/**
 * POST /api/auth/sync-profile
 * Verifies JWT and ensures a profile exists. Used after OAuth logins.
 */
export async function syncProfile(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!supabase) {
      return res.json({ message: 'Profile synced (mock mode)' });
    }

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    // Verify the JWT via Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if profile exists
    const { data: existingProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) throw profileErr;

    // If no profile exists, create one (useful for Google OAuth first-time logins)
    if (!existingProfile) {
      const email = user.email || '';
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const fullName = user.user_metadata?.full_name || null;
      const avatarUrl = user.user_metadata?.avatar_url || null;

      await supabase.from('profiles').insert({
        id: user.id,
        email: email,
        username: username,
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      
      // Upsert into legacy users table as well
      await supabase.from('users').upsert({
        id: user.id,
        email: email,
        username: username,
      }, { onConflict: 'id' });
    }

    res.json({ message: 'Profile synchronized successfully' });
  } catch (err) {
    console.error('Sync profile error:', err);
    res.status(500).json({ error: 'Failed to sync profile' });
  }
}
