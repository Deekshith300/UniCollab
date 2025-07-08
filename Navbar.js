import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import appLogo from '../assets/app-logo.png';
import './Navbar.css';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[1][0];
}

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Sync user state with localStorage on mount and when window regains focus
    const syncUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser && storedUser.username ? storedUser : null);
      } else {
        setUser(null);
      }
    };
    syncUser();
    window.addEventListener('focus', syncUser);
    return () => window.removeEventListener('focus', syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar glass-card" aria-label="Main Navigation">
      <div className="navbar-logo" onClick={() => navigate('/')}
        tabIndex={0} role="button" aria-label="Go to Home" onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/') }>
        <img src={appLogo} alt="UniCollab Logo" className="navbar-app-logo" />
        <span className="navbar-title">UniCollab</span>
      </div>
      <button className="navbar-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="navbar-menu" onClick={() => setMenuOpen(!menuOpen)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setMenuOpen(!menuOpen)}>
        <span className="navbar-toggle-bar"></span>
        <span className="navbar-toggle-bar"></span>
        <span className="navbar-toggle-bar"></span>
      </button>
      <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`} id="navbar-menu">
        <li><Link to="/" className="active-home">Home</Link></li>
        <li><Link to="/groups">Groups</Link></li>
        <li><Link to="/notes">Notes</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        {user ? (
          <>
            <li className="navbar-profile-link">
              <Link to="/profile" aria-label="My Profile">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="navbar-avatar" />
                ) : (
                  <span className="navbar-avatar-initials">{getInitials(user.name || user.username)}</span>
                )}
                <span className="navbar-username">{user.username}</span>
              </Link>
            </li>
            <li><button className="navbar-logout-btn" onClick={handleLogout} aria-label="Logout">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar; 