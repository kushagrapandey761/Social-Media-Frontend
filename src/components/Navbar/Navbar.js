import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import './Navbar.css';
import socket from '../../socket';
import { api } from '../../services/api';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial unseen messages count & listen to socket events
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      api.getUnseenMessagesCount()
        .then(data => setUnseenCount(data.count))
        .catch(err => console.error("Error fetching unseen count:", err));
    }

    const handleMessageSeen = (countToSubtract) => {
      setUnseenCount(prev => Math.max(0, prev - countToSubtract));
    };

    const handleReceiveMessage = (message) => {
      // If user isn't actively reading this exact chat, bump unseen
      setUnseenCount(prev => prev + 1);
    };

    socket.on("messagesMarkedAsSeen", handleMessageSeen);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("messagesMarkedAsSeen", handleMessageSeen);
      socket.off("receiveMessage", handleReceiveMessage);
    };
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
          <Link to="/chat" className="nav-link messages-link">
            Messages
            {unseenCount > 0 && <span className="unseen-badge">{unseenCount > 99 ? '99+' : unseenCount}</span>}
          </Link>
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
        <Link to="/chat" className="mobile-link messages-link">
          Messages
          {unseenCount > 0 && <span className="unseen-badge">{unseenCount > 99 ? '99+' : unseenCount}</span>}
        </Link>
        <Link to="/profile" className="mobile-link">Profile</Link>
        {!isLoggedIn && (
            <div className="mobile-actions">
            <Link to="/login" className="btn-secondary mobile-btn">Log In</Link>
            <Link to="/register" className="btn-primary mobile-btn">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
