import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container animate-fade-in">
      <div className="landing-content">
        <h1 className="landing-title">
          Connect. <span className="highlight">Share.</span> Thrive.
        </h1>
        <p className="landing-subtitle">
          Join the most vibrant community of creators and thinkers. 
          Experience a new way to interact with the world around you.
        </p>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">✨</div>
            <h3>Discover</h3>
            <p>Find content that matters to you with our smart feed.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🤝</div>
            <h3>Connect</h3>
            <p>Build meaningful relationships with like-minded people.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🚀</div>
            <h3>Grow</h3>
            <p>Expand your audience and boost your personal brand.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
