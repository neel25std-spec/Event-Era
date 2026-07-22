import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Event API ────────────────────────────────────────────────────────────

export async function fetchEvents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.event_type) params.set('event_type', filters.event_type);
  if (filters.food_type) params.set('food_type', filters.food_type);
  const { data } = await api.get(`/events?${params}`);
  return data;
}

export async function searchEvents(params) {
  const { data } = await api.get('/events/search', { params });
  return data;
}

export async function fetchNearbyEvents(lat, lng, radius = 10) {
  const { data } = await api.get('/events/nearby', {
    params: { lat, lng, radius },
  });
  return data;
}

export async function fetchEventById(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

export async function createEvent(eventData) {
  const { data } = await api.post('/events', eventData);
  return data;
}

export async function updateEvent(id, updates) {
  const { data } = await api.put(`/events/${id}`, updates);
  return data;
}

export async function deleteEvent(id) {
  const { data } = await api.delete(`/events/${id}`);
  return data;
}

// ── Event Joins ──────────────────────────────────────────────────────────

export async function joinEvent(id) {
  const { data } = await api.post(`/events/${id}/join`);
  return data;
}

export async function leaveEvent(id) {
  const { data } = await api.post(`/events/${id}/leave`);
  return data;
}

// ── Event Comments ───────────────────────────────────────────────────────

export async function fetchComments(id) {
  const { data } = await api.get(`/events/${id}/comments`);
  return data;
}

export async function postComment(id, commentText) {
  const { data } = await api.post(`/events/${id}/comments`, { comment: commentText });
  return data;
}

export async function deleteComment(id) {
  const { data } = await api.delete(`/comments/${id}`);
  return data;
}

// ── User Profile ─────────────────────────────────────────────────────────

export async function fetchUserProfile() {
  const { data } = await api.get('/events/user/profile');
  return data;
}

export async function fetchProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function updateProfile(profileData) {
  const { data } = await api.put('/profile', profileData);
  return data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteAvatar() {
  const { data } = await api.delete('/profile/avatar');
  return data;
}

// ── Geocoding API Proxy ───────────────────────────────────────────────────

export async function geocodePlace(query) {
  const { data } = await api.get('/geocode', { params: { q: query } });
  return data;
}

export async function reverseGeocodeCoords(lat, lng) {
  const { data } = await api.get('/reverse-geocode', { params: { lat, lng } });
  return data;
}

// ── Authentication ─────────────────────────────────────────────────────────

export async function syncAuthProfile() {
  const { data } = await api.post('/auth/sync-profile');
  return data;
}

export default api;
