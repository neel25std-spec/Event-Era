-- ============================================================
-- FreeEventMap — Supabase / PostgreSQL Migration
-- Run this in the Supabase SQL Editor to create all tables,
-- indexes, triggers, and Row Level Security policies.
-- ============================================================

-- Enable the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ──────────────────────────────────────────────────────────────
-- 1. USERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. EVENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  event_type        TEXT NOT NULL,           -- e.g. "free food", "entertainment", "community"
  food_type         TEXT,                    -- e.g. "pizza", "tacos", "vegan", null if N/A
  date              TIMESTAMPTZ NOT NULL,
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  location_name     TEXT,
  organizer_name    TEXT,
  organizer_contact TEXT,
  image_url         TEXT,
  capacity          INTEGER,
  attendees_count   INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for the nearby-events location query
CREATE INDEX IF NOT EXISTS idx_events_location ON events (latitude, longitude);
-- Index for filtering by event type / food type
CREATE INDEX IF NOT EXISTS idx_events_type ON events (event_type);
-- Index for date-sorted listings
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);

-- Auto-update the updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 3. ATTENDEES (join table)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendees (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ──────────────────────────────────────────────────────────────
-- 4. COMMENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_event ON comments (event_id);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ══════════════════════════════════════════════════════════════

-- ── EVENTS ───────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read events (public listing)
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Only authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only the event owner can update their own event
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the event owner can delete their own event
CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- ── USERS ────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ── ATTENDEES ────────────────────────────────────────────────
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendees are viewable by everyone"
  ON attendees FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join events"
  ON attendees FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can remove themselves from events"
  ON attendees FOR DELETE
  USING (auth.uid() = user_id);

-- ── COMMENTS ─────────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
