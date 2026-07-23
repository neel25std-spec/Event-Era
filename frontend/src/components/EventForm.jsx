import { useState } from 'react';
import EventMap from './EventMap';
import toast from 'react-hot-toast';
import { reverseGeocodeCoords } from '../services/api';

const EVENT_TYPES = ['free food', 'entertainment', 'community'];
const FOOD_TYPES = ['pizza', 'tacos', 'sandwiches', 'vegan', 'baked goods', 'other'];

// Helper to convert UTC string to local datetime-local format
function toLocalDatetimeString(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ onSubmit, initialData = {}, isLoading = false }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    event_type: initialData.event_type || 'free food',
    food_type: initialData.food_type || '',
    date: toLocalDatetimeString(initialData.date),
    location_name: initialData.location_name || '',
    organizer_name: initialData.organizer_name || '',
    organizer_contact: initialData.organizer_contact || '',
    capacity: initialData.capacity || '',
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || '',
  });

  const [errors, setErrors] = useState({});
  const [geoLoading, setGeoLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  // Geolocation API autofill
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    toast.loading('Fetching location...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateField('latitude', latitude.toFixed(6));
        updateField('longitude', longitude.toFixed(6));
        
        // Reverse geocode to populate location name
        try {
          const data = await reverseGeocodeCoords(latitude, longitude);
          if (data && data.display_name) {
            updateField('location_name', data.display_name);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        toast.success('Location detected! 📍', { id: 'geo' });
        setGeoLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error(`Could not fetch location: ${err.message}`, { id: 'geo' });
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  // Full client-side validation
  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    
    if (!form.date) {
      errs.date = 'Date & time are required';
    } else {
      const selectedDate = new Date(form.date);
      if (selectedDate <= new Date()) {
        errs.date = 'Date and time must be in the future';
      }
    }

    // Latitude validation
    const lat = parseFloat(form.latitude);
    if (form.latitude === '' || isNaN(lat)) {
      errs.latitude = 'Latitude is required';
    } else if (lat < -90 || lat > 90) {
      errs.latitude = 'Latitude must be between -90 and 90';
    }

    // Longitude validation
    const lng = parseFloat(form.longitude);
    if (form.longitude === '' || isNaN(lng)) {
      errs.longitude = 'Longitude is required';
    } else if (lng < -180 || lng > 180) {
      errs.longitude = 'Longitude must be between -180 and 180';
    }

    // Capacity validation
    if (form.capacity !== '') {
      const cap = parseInt(form.capacity, 10);
      if (isNaN(cap) || cap <= 0) {
        errs.capacity = 'Capacity must be a positive integer';
      }
    }

    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Notify user of errors
      toast.error('Please correct the errors in the form.');
      return;
    }
    
    onSubmit({
      ...form,
      date: new Date(form.date).toISOString(),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      capacity: form.capacity !== '' ? parseInt(form.capacity, 10) : null,
    });
  }

  async function handleMapClick(pos) {
    updateField('latitude', pos.lat.toFixed(6));
    updateField('longitude', pos.lng.toFixed(6));

    // Try reverse geocoding to fill location name
    try {
      const data = await reverseGeocodeCoords(pos.lat, pos.lng);
      if (data && data.display_name) {
        updateField('location_name', data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding error on map click:', err);
    }
  }

  const latNum = parseFloat(form.latitude);
  const lngNum = parseFloat(form.longitude);
  const showMarker = !isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;

  return (
    <form className="event-form" onSubmit={handleSubmit} id="event-form">
      {/* Title */}
      <div className="form-group">
        <label htmlFor="event-title" className="form-label">
          Event Title <span className="form-required">*</span>
        </label>
        <input
          id="event-title"
          type="text"
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder="e.g. Free Pizza Friday 🍕"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="event-desc" className="form-label">Description</label>
        <textarea
          id="event-desc"
          className="form-input form-textarea"
          placeholder="Tell people what to expect..."
          rows={3}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>

      {/* Type & Food Type row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="event-type" className="form-label">
            Event Type <span className="form-required">*</span>
          </label>
          <select
            id="event-type"
            className="form-input"
            value={form.event_type}
            onChange={(e) => updateField('event_type', e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {form.event_type === 'free food' && (
          <div className="form-group">
            <label htmlFor="food-type" className="form-label">Food Type</label>
            <select
              id="food-type"
              className="form-input"
              value={form.food_type}
              onChange={(e) => updateField('food_type', e.target.value)}
            >
              <option value="">— Select —</option>
              {FOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="form-group">
        <label htmlFor="event-date" className="form-label">
          Date & Time <span className="form-required">*</span>
        </label>
        <input
          id="event-date"
          type="datetime-local"
          className={`form-input ${errors.date ? 'form-input--error' : ''}`}
          value={form.date}
          onChange={(e) => updateField('date', e.target.value)}
        />
        {errors.date && <span className="form-error">{errors.date}</span>}
      </div>

      {/* Location name */}
      <div className="form-group">
        <label htmlFor="location-name" className="form-label">Venue / Location Name</label>
        <input
          id="location-name"
          type="text"
          className="form-input"
          placeholder="e.g. Central Park Great Lawn"
          value={form.location_name}
          onChange={(e) => updateField('location_name', e.target.value)}
        />
      </div>

      {/* Geolocation Button and Coordinates Input Fallbacks */}
      <div 
        style={{
          border: '2px dashed #1a2638',
          borderRadius: '4px',
          padding: '16px',
          background: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <span className="form-label">Coordinates Location Pinned <span className="form-required">*</span></span>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="btn btn--primary"
            style={{ padding: '8px 14px', fontSize: '0.75rem' }}
            disabled={geoLoading}
          >
            📍 USE MY LOCATION
          </button>
        </div>

        {/* Manual inputs fallback */}
        <div className="form-row" style={{ marginBottom: '14px' }}>
          <div className="form-group">
            <label htmlFor="latitude" className="form-label" style={{ fontSize: '0.75rem' }}>Latitude</label>
            <input
              id="latitude"
              type="text"
              className={`form-input ${errors.latitude ? 'form-input--error' : ''}`}
              placeholder="e.g. 40.7128"
              value={form.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
            />
            {errors.latitude && <span className="form-error">{errors.latitude}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="longitude" className="form-label" style={{ fontSize: '0.75rem' }}>Longitude</label>
            <input
              id="longitude"
              type="text"
              className={`form-input ${errors.longitude ? 'form-input--error' : ''}`}
              placeholder="e.g. -74.0060"
              value={form.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
            />
            {errors.longitude && <span className="form-error">{errors.longitude}</span>}
          </div>
        </div>
      </div>

      {/* Map Picker */}
      <div className="form-group">
        <label className="form-label">Or Click/Pin on Map</label>
        <EventMap
          events={[]}
          height="280px"
          zoom={11}
          onMapClick={handleMapClick}
          selectedPosition={showMarker ? { lat: latNum, lng: lngNum } : null}
        />
      </div>

      {/* Organizer row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="organizer-name" className="form-label">Organizer Name</label>
          <input
            id="organizer-name"
            type="text"
            className="form-input"
            placeholder="Your name or org"
            value={form.organizer_name}
            onChange={(e) => updateField('organizer_name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="organizer-contact" className="form-label">Contact Info</label>
          <input
            id="organizer-contact"
            type="text"
            className="form-input"
            placeholder="Email or phone"
            value={form.organizer_contact}
            onChange={(e) => updateField('organizer_contact', e.target.value)}
          />
        </div>
      </div>

      {/* Capacity */}
      <div className="form-group">
        <label htmlFor="capacity" className="form-label">Capacity (Max Attendees)</label>
        <input
          id="capacity"
          type="number"
          className={`form-input ${errors.capacity ? 'form-input--error' : ''}`}
          placeholder="Leave empty for unlimited"
          min="1"
          value={form.capacity}
          onChange={(e) => updateField('capacity', e.target.value)}
        />
        {errors.capacity && <span className="form-error">{errors.capacity}</span>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn--primary btn--lg btn--full"
        id="submit-event-btn"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : initialData.id ? 'Update Event' : 'Create Event 🎉'}
      </button>
    </form>
  );
}
