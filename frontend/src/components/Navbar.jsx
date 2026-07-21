import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useRequireAuth from '../hooks/useRequireAuth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { requireAuthNavigate } = useRequireAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/events', label: 'Discover', authRequired: true },
    { to: '/create', label: 'Create Event', authRequired: true },
  ];

  function handleNavClick(link) {
    if (link.authRequired) {
      requireAuthNavigate(link.to);
      return;
    }
    navigate(link.to);
  }

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo-container" id="navbar-logo">
          <span className="logo-text-event">Event</span>
          <span className="logo-text-era">Era</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <button
              key={link.to}
              type="button"
              className={`navbar-link ${location.pathname === link.to ? 'navbar-link--active' : ''}`}
              id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => handleNavClick(link)}
            >
              {link.label}
            </button>
          ))}
          {user && (
            <Link
              to="/profile"
              className={`navbar-link ${location.pathname === '/profile' ? 'navbar-link--active' : ''}`}
              id="nav-link-profile"
            >
              Profile
            </Link>
          )}
        </div>

        {/* Auth area */}
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <span className="navbar-user-email">{user.email}</span>
              <button
                type="button"
                className="btn btn--ghost"
                id="sign-out-btn"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn--primary"
              id="sign-in-btn"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="navbar-hamburger"
            id="hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar-mobile" id="mobile-menu">
          {navLinks.map((link) => (
            <button
              key={link.to}
              type="button"
              className="navbar-mobile-link"
              onClick={() => {
                setMobileOpen(false);
                handleNavClick(link);
              }}
            >
              {link.label}
            </button>
          ))}
          {user && (
            <Link
              to="/profile"
              className="navbar-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
