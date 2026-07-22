import supabase from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ═══════════════════════════════════════════════════════════════════════
// PROFILE CONTROLLER
// Handles profile CRUD and avatar upload/delete via Supabase Storage.
// ═══════════════════════════════════════════════════════════════════════

// Mock profile store for when Supabase is not configured
const MOCK_PROFILES = {};

/**
 * Saves an uploaded file to disk and returns the public URL.
 */
function saveFileToDisk(userId, file) {
  const ext = file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : file.mimetype.split('/')[1];
  const fileName = `${userId}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Remove any existing profile pics for this user
  try {
    const existing = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith(userId));
    existing.forEach(f => fs.unlinkSync(path.join(UPLOADS_DIR, f)));
  } catch (_) { /* ignore */ }

  fs.writeFileSync(filePath, file.buffer);

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/avatars/${fileName}`;
}

/**
 * GET /api/profile
 * Returns the authenticated user's profile.
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    if (!supabase) {
      const profile = MOCK_PROFILES[userId] || {
        id: userId,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        full_name: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json(profile);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist yet, create it
      if (error.code === 'PGRST116') {
        const newProfile = {
          id: userId,
          email: req.user.email,
          username: req.user.email.split('@')[0] + '_' + userId.substring(0, 4),
        };
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createErr) throw createErr;
        return res.json(created);
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error('getProfile error:', err);
    if (err.code === 'PGRST205') {
      // Table doesn't exist, fallback to mock profile
      return res.json(MOCK_PROFILES[req.user.id] || {
        id: req.user.id,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        full_name: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * PUT /api/profile
 * Updates the authenticated user's profile (username, full_name, bio).
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { username, full_name, bio } = req.body;

    // Validate username if provided
    if (username !== undefined) {
      const trimmed = username.trim();
      if (trimmed.length < 2) {
        return res.status(400).json({ error: 'Username must be at least 2 characters' });
      }
      if (trimmed.length > 50) {
        return res.status(400).json({ error: 'Username must be at most 50 characters' });
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, dots, and hyphens' });
      }
    }

    // Validate bio length
    if (bio !== undefined && bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be at most 500 characters' });
    }

    // Validate full_name length
    if (full_name !== undefined && full_name.length > 100) {
      return res.status(400).json({ error: 'Full name must be at most 100 characters' });
    }

    if (!supabase) {
      const existing = MOCK_PROFILES[userId] || {
        id: userId,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        full_name: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = {
        ...existing,
        ...(username !== undefined && { username: username.trim() }),
        ...(full_name !== undefined && { full_name: full_name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        updated_at: new Date().toISOString(),
      };
      MOCK_PROFILES[userId] = updated;
      return res.json(updated);
    }

    // Build update object with only provided fields
    const updates = {};
    if (username !== undefined) updates.username = username.trim();
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (bio !== undefined) updates.bio = bio.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation on username
      if (error.code === '23505' && error.message?.includes('username')) {
        return res.status(409).json({ error: 'This username is already taken' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('updateProfile error:', err);
    if (err.code === 'PGRST205') {
      // Table doesn't exist, fallback to mock profile
      const { username, full_name, bio } = req.body;
      const existing = MOCK_PROFILES[req.user.id] || {
        id: req.user.id,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        full_name: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = {
        ...existing,
        ...(username !== undefined && { username: username.trim() }),
        ...(full_name !== undefined && { full_name: full_name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        updated_at: new Date().toISOString(),
      };
      MOCK_PROFILES[req.user.id] = updated;
      return res.json(updated);
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * POST /api/profile/avatar
 * Uploads an avatar image to Supabase Storage and updates profile.
 * Expects multipart/form-data with a file field named "avatar".
 * Accepted formats: JPG, PNG, WEBP. Max size: 5MB.
 */
export async function uploadAvatar(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "avatar".' });
    }

    const file = req.file;

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Only JPG, PNG, and WEBP images are accepted' });
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return res.status(400).json({ error: 'File size must not exceed 5MB' });
    }

    if (!supabase) {
      const localUrl = saveFileToDisk(userId, file);
      MOCK_PROFILES[userId] = {
        ...(MOCK_PROFILES[userId] || {}),
        avatar_url: localUrl,
        updated_at: new Date().toISOString(),
      };
      return res.json({ avatar_url: localUrl, message: 'Profile picture uploaded', profile: MOCK_PROFILES[userId] });
    }

    // Determine file extension from mimetype
    const ext = file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : file.mimetype.split('/')[1];
    const filePath = `${userId}/avatar.${ext}`;

    // Delete any existing avatar files for this user first
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }
    } catch (cleanupErr) {
      console.error('Avatar cleanup error (non-fatal):', cleanupErr);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    const { data: profile, error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ avatar_url: avatarUrl, message: 'Avatar uploaded successfully', profile });
  } catch (err) {
    console.error('uploadAvatar error:', err);
    if (err.code === 'PGRST205' || err.statusCode === 404 || err.error === 'Bucket not found') {
      // Storage bucket or profiles table doesn't exist, fallback to local disk
      const userId = req.user.id;
      const localUrl = saveFileToDisk(userId, req.file);
      const existing = MOCK_PROFILES[userId] || {
        id: userId,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        full_name: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const profile = { ...existing, avatar_url: localUrl, updated_at: new Date().toISOString() };
      MOCK_PROFILES[userId] = profile;
      return res.json({ avatar_url: localUrl, message: 'Profile picture uploaded', profile });
    }
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
}

/**
 * DELETE /api/profile/avatar
 * Deletes the avatar from Supabase Storage and sets avatar_url to null.
 */
export async function deleteAvatar(req, res) {
  try {
    const userId = req.user.id;

    if (!supabase) {
      if (MOCK_PROFILES[userId]) {
        MOCK_PROFILES[userId].avatar_url = null;
        MOCK_PROFILES[userId].updated_at = new Date().toISOString();
      }
      return res.json({ message: 'Avatar deleted (mock mode)' });
    }

    // List and delete all files in the user's avatar folder
    const { data: files, error: listErr } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listErr) throw listErr;

    if (files && files.length > 0) {
      const filesToDelete = files.map((f) => `${userId}/${f.name}`);
      const { error: removeErr } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete);

      if (removeErr) throw removeErr;
    }

    // Set avatar_url to null in the profile
    const { data: profile, error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ message: 'Avatar deleted successfully', profile });
  } catch (err) {
    console.error('deleteAvatar error:', err);
    if (err.code === 'PGRST205' || err.statusCode === 404 || err.error === 'Bucket not found') {
      // Storage bucket or profiles table doesn't exist, fallback to mock
      const userId = req.user.id;
      const existing = MOCK_PROFILES[userId];
      if (existing) {
        existing.avatar_url = null;
        existing.updated_at = new Date().toISOString();
      }
      const profile = existing || {
        id: userId,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        full_name: null,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json({ message: 'Profile picture removed', profile });
    }
    res.status(500).json({ error: 'Failed to delete profile picture' });
  }
}
