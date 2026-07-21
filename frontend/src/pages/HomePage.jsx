import { Link } from 'react-router-dom';
import useRequireAuth from '../hooks/useRequireAuth';

export default function HomePage() {
  const { requireAuthNavigate } = useRequireAuth();
  return (
    <div className="home-page" id="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section" style={{ padding: '80px 0 60px' }}>
        <div className="hero-content">
          <h1 className="hero-title" style={{ marginBottom: '24px' }}>
            Discover Free Events
            <span className="hero-title-accent"> Near You</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.25rem', marginBottom: '40px' }}>
            Find free food, entertainment, and community events happening in your area.
            All events are completely free — no tickets, no fees, no hassle.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              id="explore-events-btn"
              onClick={() => requireAuthNavigate('/events')}
            >
              Explore Events 🔍
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              id="create-event-btn"
              onClick={() => requireAuthNavigate('/create')}
            >
              Create Event 🎉
            </button>
          </div>
        </div>
      </section>

      {/* 3-Feature Grid */}
      <section id="features-section" style={{ margin: '60px 0' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
          }}
        >
          {/* Feature 1 */}
          <div 
            className="event-card" 
            style={{ 
              padding: '40px 30px', 
              background: '#ffffff', 
              border: '2.5px solid #1a2638',
              borderRadius: '4px',
              boxShadow: '6px 6px 0px #1a2638'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🗺️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#1a2638' }}>
              Interactive Map
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem' }}>
              Explore local events on an intuitive map pinned by members of your community. 
              Find exactly where the action is happening and get directions instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div 
            className="event-card" 
            style={{ 
              padding: '40px 30px', 
              background: '#ffffff', 
              border: '2.5px solid #1a2638',
              borderRadius: '4px',
              boxShadow: '6px 6px 0px #1a2638'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🍕</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#1a2638' }}>
              Free Food & Fun
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem' }}>
              Discover free pizza, tacos, workshops, concerts, and neighborhood cleanups. 
              Filter by event types or food tags to find exactly what you are craving.
            </p>
          </div>

          {/* Feature 3 */}
          <div 
            className="event-card" 
            style={{ 
              padding: '40px 30px', 
              background: '#ffffff', 
              border: '2.5px solid #1a2638',
              borderRadius: '4px',
              boxShadow: '6px 6px 0px #1a2638'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#1a2638' }}>
              Community Driven
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem' }}>
              Organize your own events, coordinate with attendees, write comments, and join hands with neighbors to create amazing, accessible experiences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
