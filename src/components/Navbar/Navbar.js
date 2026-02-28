import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"></div>
          <span>SocialVibe</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Feed</Link>
          <Link to="/users" className="nav-link">Users</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </div>


        {/* Mobile Hamburger Icon */}
        <div 
          className={`mobile-menu-icon ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="mobile-link">Feed</Link>
        <Link to="/users" className="mobile-link">Users</Link>
        <Link to="/profile" className="mobile-link">Profile</Link>
        <div className="mobile-actions">
          <Link to="/login" className="btn-secondary mobile-btn">Log In</Link>
          <Link to="/register" className="btn-primary mobile-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
