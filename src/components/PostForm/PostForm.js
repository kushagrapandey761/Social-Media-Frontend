import React, { useState } from 'react';
import './PostForm.css';

const PostForm = ({ onPostCreate }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Call parent handler
    if (onPostCreate) {
      onPostCreate({ content });
    }
    
    // Reset form
    setContent('');
    setIsExpanded(false);
  };

  return (
    <div className="post-form-container glass-panel animate-fade-in">
      <div className="post-form-header">
        <div className="avatar-placeholder"></div>
        <div className="input-wrapper">
          <textarea
            className={`post-input ${isExpanded ? 'expanded' : ''}`}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="post-form-footer animate-fade-in">
          <div className="post-actions">
            <button className="action-btn" type="button" title="Add Image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            <button className="action-btn" type="button" title="Add Emoji">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
          </div>
          <div className="post-submit">
            <span className={`char-count ${content.length > 280 ? 'over-limit' : ''}`}>
              {content.length}/280
            </span>
            <button 
              className="btn-primary post-btn" 
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > 280}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;
