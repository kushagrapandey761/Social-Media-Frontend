import React, { useState, useEffect } from 'react';
import PostCard from '../../components/PostCard/PostCard';
import './Profile.css';

const MOCK_PROFILE = {
  id: 'me',
  username: 'Current User',
  handle: '@currentuser',
  bio: 'Frontend Developer | React Enthusiast | Building beautiful web experiences. 🚀💻☕️',
  followers: 1205,
  following: 342,
  joinDate: 'March 2026',
  avatar: '',
  cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'
};

const MOCK_PROFILE_POSTS = [
  {
    id: 101,
    userId: 'me',
    username: 'Current User',
    userAvatar: '',
    content: 'Just finished the main layout for my new project!',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: 15,
    comments: 2
  },
  {
    id: 102,
    userId: 'me',
    username: 'Current User',
    userAvatar: '',
    content: 'Coffee is the most important meal of the day.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    likes: 45,
    comments: 8
  }
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setProfile(MOCK_PROFILE);
      setPosts(MOCK_PROFILE_POSTS);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header glass-panel">
        <div 
          className="profile-cover" 
          style={{ backgroundImage: `url(${profile.cover})` }}
        ></div>
        
        <div className="profile-info-section">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} />
            ) : (
              <span>{profile.username.charAt(0)}</span>
            )}
          </div>
          
          <div className="profile-actions">
            <button className="btn-secondary">Edit Profile</button>
          </div>
          
          <div className="profile-details">
            <h1 className="profile-name">{profile.username}</h1>
            <span className="profile-handle">{profile.handle}</span>
            <p className="profile-bio">{profile.bio}</p>
            
            <div className="profile-stats">
              <span className="stat"><strong className="stat-value">{profile.following}</strong> Following</span>
              <span className="stat"><strong className="stat-value">{profile.followers}</strong> Followers</span>
              <span className="stat-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Joined {profile.joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button className="tab-btn active">Posts</button>
        <button className="tab-btn">Media</button>
        <button className="tab-btn">Likes</button>
      </div>
      
      <div className="profile-content">
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="empty-state">No posts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
