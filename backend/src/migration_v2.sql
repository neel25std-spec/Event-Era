-- ============================================================
-- FreeEventMap — Migration V2
-- Run this AFTER migration.sql in the Supabase SQL Editor.
-- Adds: profiles table, full-text search, storage policies.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- Separate from the existing `users` table.
-- References auth.users(id) directly for Supabase auth integration.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  username   TEXT UNIQUE,
  full_name  TEXT,
  bio        TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row changes
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username);

-- ──────────────────────────────────────────────────────────────
-- 2. RLS POLICIES FOR PROFILES
-- ──────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile (auto-created on signup)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ──────────────────────────────────────────────────────────────
-- 3. AUTO-CREATE PROFILE ON SIGNUP (Database Trigger)
-- When a new user signs up via Supabase Auth, automatically
-- insert a row into the profiles table.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::text, 1, 4)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 4. FULL-TEXT SEARCH INDEX ON EVENTS
-- Enables efficient case-insensitive search across multiple
-- event fields using PostgreSQL tsvector/tsquery.
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_fts ON events
  USING gin(
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(location_name, '') || ' ' ||
      coalesce(event_type, '') || ' ' ||
      coalesce(organizer_name, '')
    )
  );

-- Additional index for ILIKE fallback searches
CREATE INDEX IF NOT EXISTS idx_events_title_trgm ON events USING gin (title gin_trgm_ops);

-- NOTE: The trigram index above requires the pg_trgm extension.
-- If not enabled, run: CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- If you don't want to use pg_trgm, you can skip that index.
-- The FTS index (idx_events_fts) will handle most search cases.

-- ──────────────────────────────────────────────────────────────
-- 5. ADD COMMENT INDEX FOR USER LOOKUPS
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id);

-- ──────────────────────────────────────────────────────────────
-- 6. SUPABASE STORAGE — AVATARS BUCKET
-- ──────────────────────────────────────────────────────────────
-- Run these in the Supabase SQL Editor or create the bucket
-- via the Supabase Dashboard → Storage → New Bucket:
--   Bucket name: avatars
--   Public: true (so avatar URLs are publicly accessible)
--
-- Then apply these storage policies:

-- Allow authenticated users to upload their own avatar
-- Path pattern: avatars/{user_id}/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
