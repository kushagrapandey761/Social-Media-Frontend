import React, { useState, useEffect } from 'react';
import PostForm from '../../components/PostForm/PostForm';
import PostCard from '../../components/PostCard/PostCard';
import './Feed.css';
import { api } from '../../services/api';


const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchPosts = async () => {
      const response = await api.getFeed();
      setPosts(response);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handleCreatePost = ({ content }) => {
    const newPost = {
      id: Date.now(),
      userId: 'me',
      username: 'Current User',
      userAvatar: '',
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    // Prepend new post
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="feed-container">
      <div className="feed-main">
        <PostForm onPostCreate={handleCreatePost} />
        
        <div className="feed-content">
          {loading ? (
            <div className="feed-loading">
              <div className="spinner"></div>
              <p>Loading your feed...</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="feed-sidebar">
        <div className="sidebar-widget glass-panel">
          <h3>Trending Topics</h3>
          <ul className="trending-list">
            <li>#ReactJS</li>
            <li>#WebDevelopment</li>
            <li>#UIUX</li>
            <li>#Frontend</li>
          </ul>
        </div>
        
        <div className="sidebar-widget glass-panel">
          <h3>Suggested Users</h3>
          <div className="suggested-users">
            <div className="suggested-user">
              <div className="suggested-avatar">M</div>
              <div className="suggested-info">
                <span className="name">Max Design</span>
                <span className="handle">@maxdesign</span>
              </div>
              <button className="btn-secondary follow-btn">Follow</button>
            </div>
            <div className="suggested-user">
              <div className="suggested-avatar">S</div>
              <div className="suggested-info">
                <span className="name">Sarah Code</span>
                <span className="handle">@sarahcode</span>
              </div>
              <button className="btn-secondary follow-btn">Follow</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
