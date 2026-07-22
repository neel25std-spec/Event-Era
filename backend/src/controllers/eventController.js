import supabase from '../config/supabase.js';

// ── Mock database state ───────────────────────────────────────────────────
const MOCK_EVENTS = [
  {
    id: '1a2b3c4d-0001-4000-8000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Free Pizza Friday 🍕',
    description:
      'Come grab a slice! The local community center is giving away free pizza to celebrate the start of summer.',
    event_type: 'free food',
    food_type: 'pizza',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    latitude: 40.7128,
    longitude: -74.006,
    location_name: 'Central Community Center',
    organizer_name: 'NYC Community Board',
    organizer_contact: 'community@nyc.gov',
    image_url: null,
    capacity: 200,
    attendees_count: 47,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1a2b3c4d-0002-4000-8000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Open Mic Night 🎤',
    description:
      'Free open mic night at the park. Bring your talent — singing, comedy, poetry, anything goes!',
    event_type: 'entertainment',
    food_type: null,
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    latitude: 40.7282,
    longitude: -73.7949,
    location_name: 'Riverside Park Amphitheater',
    organizer_name: 'Arts Collective',
    organizer_contact: null,
    image_url: null,
    capacity: 100,
    attendees_count: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1a2b3c4d-0003-4000-8000-000000000003',
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Neighborhood Cleanup 🧹',
    description:
      'Help us clean up the neighborhood! Gloves and bags provided. Free lunch for all volunteers.',
    event_type: 'community',
    food_type: 'sandwiches',
    date: new Date(Date.now() + 1 * 86400000).toISOString(),
    latitude: 40.7489,
    longitude: -73.9680,
    location_name: 'Grand Central Area',
    organizer_name: 'Green Streets Initiative',
    organizer_contact: 'hello@greenstreets.org',
    image_url: null,
    capacity: 50,
    attendees_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1a2b3c4d-0004-4000-8000-000000000004',
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Free Yoga in the Park 🧘',
    description:
      'Start your weekend with a free outdoor yoga session. All levels welcome. Bring your own mat!',
    event_type: 'community',
    food_type: null,
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    latitude: 40.7812,
    longitude: -73.9665,
    location_name: 'Central Park Great Lawn',
    organizer_name: 'Yoga For All',
    organizer_contact: 'info@yogaforall.org',
    image_url: null,
    capacity: 80,
    attendees_count: 35,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1a2b3c4d-0005-4000-8000-000000000005',
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Taco Tuesday Giveaway 🌮',
    description:
      'Local food truck is giving away 500 free tacos to celebrate their anniversary!',
    event_type: 'free food',
    food_type: 'tacos',
    date: new Date(Date.now() + 4 * 86400000).toISOString(),
    latitude: 40.7580,
    longitude: -73.9855,
    location_name: 'Times Square Food Court',
    organizer_name: 'Taco Fiesta',
    organizer_contact: null,
    image_url: null,
    capacity: 500,
    attendees_count: 189,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1a2b3c4d-0006-4000-8000-000000000006',
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Free Coding Workshop 💻',
    description:
      'Learn the basics of web development in this beginner-friendly workshop. Laptops provided!',
    event_type: 'entertainment',
    food_type: null,
    date: new Date(Date.now() + 6 * 86400000).toISOString(),
    latitude: 40.7425,
    longitude: -73.9885,
    location_name: 'Flatiron Tech Hub',
    organizer_name: 'Code For Community',
    organizer_contact: 'learn@codeforcommunity.io',
    image_url: null,
    capacity: 30,
    attendees_count: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_ATTENDEES = [
  // user mock@user.dev joined pizza
  {
    id: 'a1',
    event_id: '1a2b3c4d-0001-4000-8000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000000',
    joined_at: new Date().toISOString()
  }
];

const MOCK_COMMENTS = [
  {
    id: 'c1',
    event_id: '1a2b3c4d-0001-4000-8000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000000',
    comment: 'Looking forward to this event! Pizza is always a great choice.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user_email: 'mock@user.dev',
  },
  {
    id: 'c2',
    event_id: '1a2b3c4d-0001-4000-8000-000000000001',
    user_id: 'mock-uuid-2',
    comment: 'Is there parking near the venue?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_email: 'driver12@dev.com',
  }
];

// Helper to ensure a row exists in the public users table (Supabase DB constraint fallback)
async function ensureUserExists(supabaseClient, id, email) {
  try {
    const { data, error } = await supabaseClient.from('users').select('id').eq('id', id).maybeSingle();
    if (error) console.error('Error fetching user profile row:', error);
    
    if (!data) {
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const { error: insertError } = await supabaseClient.from('users').insert({ id, email, username });
      if (insertError) console.error('Error inserting user profile row:', insertError);
    }
  } catch (err) {
    console.error('Failed to run ensureUserExists helper:', err);
  }
}

// Helper: Haversine distance (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/events — list events with optional filters */
export async function getAllEvents(req, res) {
  try {
    const { event_type, food_type } = req.query;

    if (!supabase) {
      let data = [...MOCK_EVENTS];
      if (event_type) data = data.filter((e) => e.event_type === event_type);
      if (food_type) data = data.filter((e) => e.food_type === food_type);
      return res.json(data);
    }

    let query = supabase.from('events').select('*').order('date', { ascending: true });
    if (event_type) query = query.eq('event_type', event_type);
    if (food_type) query = query.eq('food_type', food_type);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getAllEvents error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

/** GET /api/events/nearby — events within radius */
export async function getNearbyEvents(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query params are required' });
    }

    if (!supabase) {
      const nearby = MOCK_EVENTS.filter(
        (e) => haversineKm(lat, lng, e.latitude, e.longitude) <= radius
      );
      return res.json(nearby);
    }

    const degDelta = radius / 111;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('latitude', lat - degDelta)
      .lte('latitude', lat + degDelta)
      .gte('longitude', lng - degDelta)
      .lte('longitude', lng + degDelta)
      .order('date', { ascending: true });

    if (error) throw error;

    const filtered = data.filter(
      (e) => haversineKm(lat, lng, e.latitude, e.longitude) <= radius
    );
    res.json(filtered);
  } catch (err) {
    console.error('getNearbyEvents error:', err);
    res.status(500).json({ error: 'Failed to fetch nearby events' });
  }
}

/** GET /api/events/:id — single event */
export async function getEventById(req, res) {
  try {
    const { id } = req.params;

    if (!supabase) {
      const event = MOCK_EVENTS.find((e) => e.id === id);
      return event
        ? res.json(event)
        : res.status(404).json({ error: 'Event not found' });
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Event not found' });
    res.json(data);
  } catch (err) {
    console.error('getEventById error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}

/** POST /api/events — create event */
export async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      event_type,
      food_type,
      date,
      latitude,
      longitude,
      location_name,
      organizer_name,
      organizer_contact,
      image_url,
      capacity,
    } = req.body;

    if (!title || !event_type || !date || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ error: 'title, event_type, date, latitude, and longitude are required' });
    }

    const newEvent = {
      user_id: req.user.id,
      title,
      description: description || null,
      event_type,
      food_type: food_type || null,
      date,
      latitude,
      longitude,
      location_name: location_name || null,
      organizer_name: organizer_name || null,
      organizer_contact: organizer_contact || null,
      image_url: image_url || null,
      capacity: capacity || null,
    };

    if (!supabase) {
      const mock = {
        ...newEvent,
        id: crypto.randomUUID(),
        attendees_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_EVENTS.push(mock);
      return res.status(201).json(mock);
    }

    await ensureUserExists(supabase, req.user.id, req.user.email);

    const { data, error } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

/** PUT /api/events/:id — update own event */
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!supabase) {
      const idx = MOCK_EVENTS.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Event not found' });
      MOCK_EVENTS[idx] = { ...MOCK_EVENTS[idx], ...updates, updated_at: new Date().toISOString() };
      return res.json(MOCK_EVENTS[idx]);
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Event not found or not owned by you' });
    res.json(data);
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
}

/** DELETE /api/events/:id — delete own event */
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    if (!supabase) {
      const idx = MOCK_EVENTS.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Event not found' });
      MOCK_EVENTS.splice(idx, 1);
      return res.json({ message: 'Event deleted' });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// NEW FEATURES: EVENT JOINS, COMMENTS & PROFILES
// ═══════════════════════════════════════════════════════════════════════

/** POST /api/events/:id/join — Join an event */
export async function joinEvent(req, res) {
  try {
    const { id } = req.params;

    if (!supabase) {
      const event = MOCK_EVENTS.find((e) => e.id === id);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      
      const alreadyJoined = MOCK_ATTENDEES.some((a) => a.event_id === id && a.user_id === req.user.id);
      if (alreadyJoined) {
        return res.json({ message: 'Already joined event' });
      }

      if (event.capacity && event.attendees_count >= event.capacity) {
        return res.status(400).json({ error: 'Event capacity reached' });
      }

      MOCK_ATTENDEES.push({
        id: crypto.randomUUID(),
        event_id: id,
        user_id: req.user.id,
        joined_at: new Date().toISOString()
      });
      event.attendees_count += 1;

      return res.json({ message: 'Successfully joined event', attendees_count: event.attendees_count });
    }

    await ensureUserExists(supabase, req.user.id, req.user.email);

    // Get current capacity/occupancy
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('capacity, attendees_count')
      .eq('id', id)
      .single();

    if (eventErr || !event) return res.status(404).json({ error: 'Event not found' });
    if (event.capacity && event.attendees_count >= event.capacity) {
      return res.status(400).json({ error: 'Event capacity reached' });
    }

    // Insert join row (Unique constraint event_id + user_id will catch duplicates)
    const { error: joinErr } = await supabase
      .from('attendees')
      .insert({ event_id: id, user_id: req.user.id });

    if (joinErr && joinErr.code !== '23505') { // Code 23505 = unique_violation
      throw joinErr;
    }

    // Update count
    const { count } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    await supabase.from('events').update({ attendees_count: count }).eq('id', id);

    res.json({ message: 'Successfully joined event', attendees_count: count });
  } catch (err) {
    console.error('joinEvent error:', err);
    res.status(500).json({ error: 'Failed to join event' });
  }
}

/** POST /api/events/:id/leave — Leave an event */
export async function leaveEvent(req, res) {
  try {
    const { id } = req.params;

    if (!supabase) {
      const event = MOCK_EVENTS.find((e) => e.id === id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const idx = MOCK_ATTENDEES.findIndex((a) => a.event_id === id && a.user_id === req.user.id);
      if (idx !== -1) {
        MOCK_ATTENDEES.splice(idx, 1);
        event.attendees_count = Math.max(0, event.attendees_count - 1);
      }

      return res.json({ message: 'Successfully left event', attendees_count: event.attendees_count });
    }

    // Delete attendee row
    const { error: leaveErr } = await supabase
      .from('attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', req.user.id);

    if (leaveErr) throw leaveErr;

    // Recount
    const { count } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    await supabase.from('events').update({ attendees_count: count }).eq('id', id);

    res.json({ message: 'Successfully left event', attendees_count: count });
  } catch (err) {
    console.error('leaveEvent error:', err);
    res.status(500).json({ error: 'Failed to leave event' });
  }
}

/** GET /api/events/:id/comments — Get event comments (newest first) */
export async function getEventComments(req, res) {
  try {
    const { id } = req.params;

    if (!supabase) {
      const comments = MOCK_COMMENTS
        .filter((c) => c.event_id === id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json(comments);
    }

    // Join with profiles to get username and avatar_url, fall back to users for email
    const { data, error } = await supabase
      .from('comments')
      .select('id, comment, created_at, user_id, users(email), profiles:user_id(username, avatar_url)')
      .eq('event_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map nested join results to flat fields with profile info
    const formatted = data.map((c) => ({
      id: c.id,
      comment: c.comment,
      created_at: c.created_at,
      user_id: c.user_id,
      user_email: c.users?.email || 'unknown@user.com',
      username: c.profiles?.username || c.users?.email?.split('@')[0] || 'anonymous',
      avatar_url: c.profiles?.avatar_url || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getEventComments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

/** POST /api/events/:id/comments — Add comment to event */
export async function createComment(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (!supabase) {
      const mockComment = {
        id: crypto.randomUUID(),
        event_id: id,
        user_id: req.user.id,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        user_email: req.user.email,
      };
      MOCK_COMMENTS.push(mockComment);
      return res.status(201).json(mockComment);
    }

    await ensureUserExists(supabase, req.user.id, req.user.email);

    const { data, error } = await supabase
      .from('comments')
      .insert({
        event_id: id,
        user_id: req.user.id,
        comment: comment.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
      comment: data.comment,
      created_at: data.created_at,
      user_id: data.user_id,
      user_email: req.user.email,
    });
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
}

/** GET /api/events/user/profile — Get logged in user's profile events */
export async function getUserProfileEvents(req, res) {
  try {
    const userId = req.user.id;

    if (!supabase) {
      const created = MOCK_EVENTS.filter((e) => e.user_id === userId);
      const joinedIds = MOCK_ATTENDEES.filter((a) => a.user_id === userId).map((a) => a.event_id);
      const joined = MOCK_EVENTS.filter((e) => joinedIds.includes(e.id));
      
      return res.json({ createdEvents: created, joinedEvents: joined });
    }

    // Fetch created events
    const { data: created, error: createdErr } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (createdErr) throw createdErr;

    // Fetch joined events (via subquery on attendees)
    const { data: joinedRows, error: joinedErr } = await supabase
      .from('attendees')
      .select('event_id')
      .eq('user_id', userId);

    if (joinedErr) throw joinedErr;

    const eventIds = joinedRows.map((row) => row.event_id);
    let joined = [];

    if (eventIds.length > 0) {
      const { data: joinedEvents, error: eventsErr } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('date', { ascending: true });

      if (eventsErr) throw eventsErr;
      joined = joinedEvents;
    }

    res.json({ createdEvents: created, joinedEvents: joined });
  } catch (err) {
    console.error('getUserProfileEvents error:', err);
    if (err.code === 'PGRST205') {
      const created = MOCK_EVENTS.filter((e) => e.user_id === req.user.id);
      const joinedIds = MOCK_ATTENDEES.filter((a) => a.user_id === req.user.id).map((a) => a.event_id);
      const joined = MOCK_EVENTS.filter((e) => joinedIds.includes(e.id));
      return res.json({ createdEvents: created, joinedEvents: joined });
    }
    res.status(500).json({ error: 'Failed to fetch user profile events' });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DELETE COMMENT & SEARCH EVENTS
// ═══════════════════════════════════════════════════════════════════════

/** DELETE /api/comments/:id — Delete own comment */
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!supabase) {
      const idx = MOCK_COMMENTS.findIndex((c) => c.id === id && c.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Comment not found or not owned by you' });
      }
      MOCK_COMMENTS.splice(idx, 1);
      return res.json({ message: 'Comment deleted' });
    }

    // Only delete if the comment belongs to the authenticated user
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Comment not found or not owned by you' });
    }
    if (error) throw error;

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}

/**
 * GET /api/events/search — Search and filter events
 * Query params:
 *   q        — search term (searches title, description, location, category, organizer)
 *   category — filter by event_type
 *   date     — 'today' | 'tomorrow' | 'this_week'
 *   food     — filter by food_type (truthy = has food)
 *   sort     — 'newest' | 'oldest' | 'upcoming' | 'recent'
 *   lat, lng, radius — proximity filtering
 */
export async function searchEvents(req, res) {
  try {
    const { q, category, date, food, sort, lat, lng, radius } = req.query;

    if (!supabase) {
      // Mock search: simple case-insensitive filter
      let results = [...MOCK_EVENTS];
      const searchTerm = (q || '').toLowerCase();

      if (searchTerm) {
        results = results.filter((e) =>
          (e.title || '').toLowerCase().includes(searchTerm) ||
          (e.description || '').toLowerCase().includes(searchTerm) ||
          (e.location_name || '').toLowerCase().includes(searchTerm) ||
          (e.event_type || '').toLowerCase().includes(searchTerm) ||
          (e.organizer_name || '').toLowerCase().includes(searchTerm)
        );
      }

      if (category) results = results.filter((e) => e.event_type === category);
      if (food) results = results.filter((e) => !!e.food_type);

      // Date filtering
      if (date) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (date === 'today') {
          const endOfToday = new Date(startOfToday.getTime() + 86400000);
          results = results.filter((e) => {
            const d = new Date(e.date);
            return d >= startOfToday && d < endOfToday;
          });
        } else if (date === 'tomorrow') {
          const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);
          const endOfTomorrow = new Date(startOfToday.getTime() + 2 * 86400000);
          results = results.filter((e) => {
            const d = new Date(e.date);
            return d >= startOfTomorrow && d < endOfTomorrow;
          });
        } else if (date === 'this_week') {
          const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);
          results = results.filter((e) => {
            const d = new Date(e.date);
            return d >= startOfToday && d < endOfWeek;
          });
        }
      }

      // Sorting
      switch (sort) {
        case 'newest': results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
        case 'oldest': results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
        case 'upcoming': results.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
        case 'recent':
        default: results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); break;
      }

      return res.json(results);
    }

    // Build Supabase query
    let query = supabase.from('events').select('*');

    // Full-text search using PostgreSQL tsvector
    if (q && q.trim()) {
      const searchTerms = q.trim().split(/\s+/).filter(Boolean);
      // Use websearch_to_tsquery for more flexible matching
      // Fallback: combine ILIKE for simple substring matching
      const tsquery = searchTerms.map((t) => `'${t}'`).join(' & ');
      query = query.or(
        `title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,location_name.ilike.%${q.trim()}%,event_type.ilike.%${q.trim()}%,organizer_name.ilike.%${q.trim()}%`
      );
    }

    // Category filter
    if (category) {
      query = query.eq('event_type', category);
    }

    // Food available filter
    if (food) {
      query = query.not('food_type', 'is', null);
    }

    // Date filtering
    if (date) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (date === 'today') {
        const endOfToday = new Date(startOfToday.getTime() + 86400000);
        query = query.gte('date', startOfToday.toISOString()).lt('date', endOfToday.toISOString());
      } else if (date === 'tomorrow') {
        const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);
        const endOfTomorrow = new Date(startOfToday.getTime() + 2 * 86400000);
        query = query.gte('date', startOfTomorrow.toISOString()).lt('date', endOfTomorrow.toISOString());
      } else if (date === 'this_week') {
        const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);
        query = query.gte('date', startOfToday.toISOString()).lt('date', endOfWeek.toISOString());
      }
    }

    // Proximity filtering
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusKm = parseFloat(radius) || 10;

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const degDelta = radiusKm / 111;
        query = query
          .gte('latitude', latNum - degDelta)
          .lte('latitude', latNum + degDelta)
          .gte('longitude', lngNum - degDelta)
          .lte('longitude', lngNum + degDelta);
      }
    }

    // Sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'upcoming':
        query = query.order('date', { ascending: true });
        break;
      case 'recent':
        query = query.order('updated_at', { ascending: false });
        break;
      default:
        query = query.order('date', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;

    // If proximity filtering was used, apply Haversine post-filter
    let results = data;
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusKm = parseFloat(radius) || 10;
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        results = data.filter(
          (e) => haversineKm(latNum, lngNum, e.latitude, e.longitude) <= radiusKm
        );
      }
    }

    res.json(results);
  } catch (err) {
    console.error('searchEvents error:', err);
    res.status(500).json({ error: 'Failed to search events' });
  }
}
