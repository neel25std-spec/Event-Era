import { useNavigate } from 'react-router-dom';

const TYPE_COLORS = {
  'free food': { bg: 'var(--color-accent-500)', text: '#fff' },
  entertainment: { bg: 'var(--color-primary-500)', text: '#fff' },
  community: { bg: '#10b981', text: '#fff' },
};

const TYPE_ICONS = {
  'free food': '🍕',
  entertainment: '🎤',
  community: '🤝',
};

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const typeStyle = TYPE_COLORS[event.event_type] || { bg: '#64748b', text: '#fff' };
  const typeIcon = TYPE_ICONS[event.event_type] || '📌';

  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const spotsLeft = event.capacity
    ? event.capacity - event.attendees_count
    : null;

  return (
    <article
      className="event-card"
      id={`event-card-${event.id}`}
      onClick={() => navigate(`/event/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/event/${event.id}`)}
    >
      {/* Glow accent */}
      <div
        className="event-card-glow"
        style={{ background: typeStyle.bg }}
      />

      <div className="event-card-content">
        {/* Header */}
        <div className="event-card-header">
          <span
            className="event-card-badge"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {typeIcon} {event.event_type}
          </span>
          {event.food_type && (
            <span className="event-card-food-badge">
              🍽️ {event.food_type}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="event-card-title">{event.title}</h3>

        {/* Description */}
        {event.description && (
          <p className="event-card-desc">{event.description}</p>
        )}

        {/* Meta info */}
        <div className="event-card-meta">
          <div className="event-card-meta-row">
            <span className="event-card-icon">📅</span>
            <span>{dateStr} · {timeStr}</span>
          </div>
          {event.location_name && (
            <div className="event-card-meta-row">
              <span className="event-card-icon">📍</span>
              <span>{event.location_name}</span>
            </div>
          )}
          {event.organizer_name && (
            <div className="event-card-meta-row">
              <span className="event-card-icon">👤</span>
              <span>{event.organizer_name}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="event-card-footer">
          <div className="event-card-attendees">
            <span className="event-card-attendees-count">
              {event.attendees_count}
            </span>
            <span className="event-card-attendees-label">attending</span>
          </div>
          {spotsLeft !== null && (
            <span
              className={`event-card-spots ${spotsLeft <= 5 ? 'event-card-spots--low' : ''}`}
            >
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
