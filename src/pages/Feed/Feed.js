import React, { useState, useEffect } from 'react';
import PostForm from '../../components/PostForm/PostForm';
import PostCard from '../../components/PostCard/PostCard';
import './Feed.css';

const MOCK_POSTS = [
  {
    id: 1,
    userId: 'u1',
    username: 'Anna Smith',
    userAvatar: '',
    content: 'Just launched my new portfolio! Extremely excited to share this with everyone. 🚀✨',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likes: 42,
    comments: 5
  },
  {
    id: 2,
    userId: 'u2',
    username: 'Devon Miles',
    userAvatar: '',
    content: 'Learning React has been quite the journey. Loving the component-based architecture and exactly how easy it is to manage state with hooks.',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likes: 128,
    comments: 14
  }
];

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchPosts = () => {
      setTimeout(() => {
        setPosts(MOCK_POSTS);
        setLoading(false);
      }, 800);
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
