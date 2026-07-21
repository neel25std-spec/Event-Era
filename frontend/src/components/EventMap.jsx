import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix default marker icons in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user-location marker
const userIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: '<div class="user-dot"></div><div class="user-pulse"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom search-center marker
const searchCenterIcon = new L.DivIcon({
  className: 'search-center-marker',
  html: '<div style="background: var(--color-yellow-500); width: 20px; height: 20px; border: 3px solid #1a2638; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Event marker with color by type
function eventIcon(type) {
  const colors = {
    'free food': '#ec4899',
    entertainment: '#6366f1',
    community: '#10b981',
  };
  const color = colors[type] || '#64748b';

  return new L.DivIcon({
    className: 'event-marker-icon',
    html: `<div style="
      background: ${color};
      width: 32px; height: 32px;
      border-radius: 50% 50% 50% 4px;
      transform: rotate(-45deg);
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

/** Pan/zoom the map to fit events */
function FitBounds({ events, userLat, userLng }) {
  const map = useMap();

  useEffect(() => {
    if (!events.length && !userLat) return;

    const points = events.map((e) => [e.latitude, e.longitude]);
    if (userLat && userLng) points.push([userLat, userLng]);

    if (points.length) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 14 });
    }
  }, [events, userLat, userLng, map]);

  return null;
}

/** Programmatically controls map viewport */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      const lat = Array.isArray(center) ? center[0] : center.lat;
      const lng = Array.isArray(center) ? center[1] : center.lng;
      if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], zoom || map.getZoom());
      }
    }
  }, [center, zoom, map]);
  return null;
}

export default function EventMap({
  events = [],
  userLat = null,
  userLng = null,
  searchLat = null,
  searchLng = null,
  center = [40.7128, -74.006],
  zoom = 12,
  height = '450px',
  onMapClick = null,
  selectedPosition = null,
  disableFitBounds = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="event-map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        id="event-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!disableFitBounds && (
          <FitBounds events={events} userLat={userLat} userLng={userLng} />
        )}

        <MapController
          center={searchLat && searchLng ? [searchLat, searchLng] : center}
          zoom={zoom}
        />

        {/* Click handler for location picker */}
        {onMapClick && <MapClickHandler onClick={onMapClick} />}

        {/* User location */}
        {userLat && userLng && (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <strong>📍 You are here</strong>
            </Popup>
          </Marker>
        )}

        {/* Search center marker */}
        {searchLat && searchLng && (
          <Marker position={[searchLat, searchLng]} icon={searchCenterIcon}>
            <Popup>
              <strong>🔍 Search Center</strong>
            </Popup>
          </Marker>
        )}

        {/* Selected position (for event creation) */}
        {selectedPosition && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
            <Popup>
              <strong>📌 Event location</strong>
            </Popup>
          </Marker>
        )}

        {/* Event markers */}
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={eventIcon(event.event_type)}
          >
            <Popup>
              <div className="map-popup">
                <strong>{event.title}</strong>
                <p className="map-popup-type">{event.event_type}</p>
                {event.location_name && (
                  <p className="map-popup-location">📍 {event.location_name}</p>
                )}
                <button
                  type="button"
                  className="map-popup-btn"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/** Inner component to handle map clicks */
function MapClickHandler({ onClick }) {
  const map = useMap();

  useEffect(() => {
    const handler = (e) => {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onClick]);

  return null;
}
