export default function Footer() {
  return (
    <footer className="footer" id="main-footer" style={{ borderTop: '4px solid #1a2638', background: '#f8fafc', padding: '60px 20px 30px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Brand Section */}
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#1a2638', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2.2rem' }}>📍</span> EventEra
            </span>
            <p style={{ marginTop: '16px', color: '#4b5563', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Discover, share, and enjoy free events happening near you. Building stronger communities one event at a time.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <a href="#" style={{ color: '#1a2638', fontSize: '1.5rem', textDecoration: 'none' }}>𝕏</a>
              <a href="#" style={{ color: '#1a2638', fontSize: '1.5rem', textDecoration: 'none' }}>📸</a>
              <a href="#" style={{ color: '#1a2638', fontSize: '1.5rem', textDecoration: 'none' }}>🐙</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: '#1a2638', marginBottom: '20px', textTransform: 'uppercase' }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Home</a></li>
              <li><a href="/events" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Explore Events</a></li>
              <li><a href="/create" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Host an Event</a></li>
              <li><a href="/login" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Sign In</a></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: '#1a2638', marginBottom: '20px', textTransform: 'uppercase' }}>
              Legal & Support
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Terms of Service</a></li>
              <li><a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Community Guidelines</a></li>
              <li><a href="mailto:support@eventera.com" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#004b87'} onMouseOut={e => e.target.style.color = '#64748b'}>Contact Us</a></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            © {new Date().getFullYear()} EventEra. All rights reserved.
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              background: '#1a2638',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '3px 3px 0px var(--color-primary-400)',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = '0px 0px 0px transparent'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--color-primary-400)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--color-primary-400)'; }}
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
