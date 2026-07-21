import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import EventMap from '../components/EventMap';
import useGeolocation from '../hooks/useGeolocation';
import { fetchEvents, fetchNearbyEvents, geocodePlace, reverseGeocodeCoords } from '../services/api';
import toast from 'react-hot-toast';

const FOOD_TYPES = [
  { value: '', label: 'All Foods 🍽️' },
  { value: 'pizza', label: 'Pizza 🍕' },
  { value: 'tacos', label: 'Tacos 🌮' },
  { value: 'sandwiches', label: 'Sandwiches 🥪' },
  { value: 'vegan', label: 'Vegan 🥗' },
  { value: 'baked goods', label: 'Baked Goods 🥐' },
  { value: 'other', label: 'Other' },
];

const DATE_FILTERS = [
  { value: 'all', label: 'All Dates 📅' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
];

const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Date: Upcoming First' },
  { value: 'newest', label: 'Added: Newest First' },
  { value: 'oldest', label: 'Added: Oldest First' },
  { value: 'recent', label: 'Recently Updated' },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodFilter, setFoodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOption, setSortOption] = useState('upcoming');
  const [nearbyMode, setNearbyMode] = useState(false);

  // Default search center at New York City
  const [searchLocation, setSearchLocation] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    name: 'New York, NY, USA'
  });
  const [addressInput, setAddressInput] = useState('New York, NY');
  const [searchLoading, setSearchLoading] = useState(false);

  const { latitude, longitude, getGeolocation, loading: geoLoading } = useGeolocation();

  // Extract location beforehand using IP Geolocation (no browser prompt)
  useEffect(() => {
    async function fetchIpLocation() {
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.latitude && data.longitude) {
            setSearchLocation({
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              name: `${data.city || 'Unknown'}, ${data.region || ''}`
            });
            setAddressInput(`${data.city || ''}, ${data.region || ''}`.replace(/^, | , $/g, '').trim());
          }
        }
      } catch (error) {
        console.error('Failed to fetch IP location:', error);
      }
    }
    fetchIpLocation();
  }, []);

  // Load events based on filters and searchLocation
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let data;
        const params = {};
        
        if (searchQuery) params.q = searchQuery;
        if (foodFilter) params.food = 'true';
        if (dateFilter !== 'all') {
          if (dateFilter === 'week') params.date = 'this_week';
          else params.date = dateFilter;
        }
        params.sort = sortOption;

        if (nearbyMode && searchLocation.latitude && searchLocation.longitude) {
          params.lat = searchLocation.latitude;
          params.lng = searchLocation.longitude;
          params.radius = 15;
        }

        const { searchEvents } = await import('../services/api');
        data = await searchEvents(params);



        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events from the API.');
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, foodFilter, dateFilter, sortOption, nearbyMode, searchLocation]);

  async function handleSearchLocation(e) {
    if (e) e.preventDefault();
    if (!addressInput.trim()) return;
    setSearchLoading(true);
    const toastId = toast.loading('Searching location...');
    try {
      const data = await geocodePlace(addressInput);
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setSearchLocation({
          latitude: latNum,
          longitude: lonNum,
          name: display_name
        });
        setAddressInput(display_name);
        setNearbyMode(true);
        toast.success(`Search center set to: ${display_name.split(',')[0]} 📍`, { id: toastId });
      } else {
        toast.error('Location not found. Try a different query.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to geocode location.', { id: toastId });
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleLocateMe() {
    const toastId = toast.loading('Detecting device location...');
    try {
      const coords = await getGeolocation();
      
      let locationName = 'Current Location';
      try {
        const data = await reverseGeocodeCoords(coords.latitude, coords.longitude);
        if (data && data.display_name) {
          locationName = data.display_name;
        }
      } catch (rgErr) {
        console.error('Reverse geocoding error during Locate Me:', rgErr);
      }

      setSearchLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        name: locationName
      });
      setAddressInput(locationName);
      setNearbyMode(true);
      toast.success('Location detected successfully! 📍', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Could not detect location: ${err.message || 'Permission denied'}`, { id: toastId });
    }
  }

  async function handleMapClick(coords) {
    const { lat, lng } = coords;
    setSearchLocation({
      latitude: lat,
      longitude: lng,
      name: `Map Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });
    setAddressInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setNearbyMode(true);

    // Try reverse geocoding to resolve a clean address
    try {
      const data = await reverseGeocodeCoords(lat, lng);
      if (data && data.display_name) {
        setSearchLocation({
          latitude: lat,
          longitude: lng,
          name: data.display_name
        });
        setAddressInput(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  }

  return (
    <div className="events-page" id="events-explorer-page">
      {/* Top Filter Bar */}
      <div 
        style={{ 
          background: '#ffffff', 
          border: '2.5px solid #1a2638', 
          boxShadow: '4px 4px 0px #1a2638',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search events by title, description, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '4px',
              border: '2px solid #1a2638',
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', flexGrow: 1 }}>
          {/* Food filter dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold' }}>FOOD TYPE</span>
            <select
              value={foodFilter}
              onChange={(e) => {
                setFoodFilter(e.target.value);
                setNearbyMode(false);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '2px solid #1a2638',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff'
              }}
            >
              {FOOD_TYPES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Date filter dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold' }}>DATE RANGE</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '2px solid #1a2638',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff'
              }}
            >
              {DATE_FILTERS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold' }}>SORT BY</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '2px solid #1a2638',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff'
              }}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Location search bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: '220px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold' }}>SEARCH CENTER</span>
            <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="City or place..."
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '2px solid #1a2638',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  flexGrow: 1,
                  backgroundColor: '#ffffff'
                }}
              />
              <button
                type="submit"
                className="btn btn--primary"
                style={{ padding: '8px 12px', fontSize: '0.8rem', boxShadow: '2px 2px 0px #1a2638', cursor: 'pointer' }}
                disabled={searchLoading}
                title="Search location"
              >
                {searchLoading ? '...' : '🔍'}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleLocateMe}
                style={{ padding: '8px 12px', fontSize: '0.8rem', boxShadow: '2px 2px 0px #1a2638', cursor: 'pointer' }}
                disabled={geoLoading}
                title="Locate my device position"
              >
                {geoLoading ? '...' : '📍'}
              </button>
            </form>
          </div>
        </div>

        {/* Near search center toggle button */}
        <button
          type="button"
          onClick={() => setNearbyMode(!nearbyMode)}
          className={`filter-chip ${nearbyMode ? 'filter-chip--active' : ''}`}
          style={{ height: 'fit-content' }}
        >
          📍 FILTER NEAR CENTER (15KM)
        </button>
      </div>

      {/* Main Split Layout */}
      <div 
        className="split-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          minHeight: '600px',
          alignItems: 'stretch'
        }}
      >
        {/* Left Side: Map */}
        <div style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 250px)', minHeight: '400px' }} className="split-map-container">
          <EventMap
            events={events}
            userLat={latitude}
            userLng={longitude}
            searchLat={searchLocation.latitude}
            searchLng={searchLocation.longitude}
            height="100%"
            onMapClick={handleMapClick}
            disableFitBounds={nearbyMode}
          />
        </div>

        {/* Right Side: Scrollable list */}
        <div 
          style={{ 
            height: 'calc(100vh - 250px)', 
            overflowY: 'auto',
            paddingRight: '10px'
          }} 
          className="split-list-container"
        >
          {loading && (
            <div className="events-loading" style={{ width: '100%' }}>
              <div className="spinner" />
              <p>LOADING EVENTS...</p>
            </div>
          )}

          {error && (
            <div className="events-error" style={{ width: '100%' }}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="events-empty" style={{ width: '100%' }}>
              <span className="events-empty-icon">🎈</span>
              <h3>No events match your criteria</h3>
              <p>Try resetting filters or changing your search options.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '20px',
              }}
            >
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS adjustments to stack split layout on smaller viewports */}
      <style>{`
        @media (max-width: 820px) {
          .split-layout {
            grid-template-columns: 1fr !important;
          }
          .split-map-container {
            position: relative !important;
            top: 0 !important;
            height: 320px !important;
            min-height: 320px !important;
          }
          .split-list-container {
            height: auto !important;
            overflow-y: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
