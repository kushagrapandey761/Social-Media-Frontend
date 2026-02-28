import React, { useState } from 'react';
import { Link } from 'react-router';
import './PostCard.css';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
      setLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setLiked(true);
    }
  };

  // Format date helper (mocked implementation)
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="post-card glass-panel animate-fade-in">
      <div className="post-header">
        <Link to={`/profile/${post.userId}`} className="post-author-info">
          <div className="author-avatar" style={{ backgroundImage: `url(${post.userAvatar})` }}>
            {!post.userAvatar && (post.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="author-meta">
            <h4 className="author-name">{post.username || 'Unknown User'}</h4>
            <span className="post-time">{formatDate(post.createdAt || new Date())}</span>
          </div>
        </Link>
        <button className="post-options-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post attachment" className="post-image" />
          </div>
        )}
      </div>
      
      <div className="post-actions-bar">
        <button 
          className={`interaction-btn ${liked ? 'liked' : ''}`} 
          onClick={handleLike}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{likeCount}</span>
        </button>
        
        <button className="interaction-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span>{post.comments || 0}</span>
        </button>

        <button className="interaction-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
