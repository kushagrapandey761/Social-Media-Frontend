import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './Users.css';

const MOCK_USERS = [
  {
    id: 'u1',
    username: 'Anna Smith',
    handle: '@annasmith',
    bio: 'Digital nomad and photographer.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isFollowing: false
  },
  {
    id: 'u2',
    username: 'Devon Miles',
    handle: '@devonm',
    bio: 'Software engineer building web things.',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    isFollowing: true
  },
  {
    id: 'u3',
    username: 'Sarah Code',
    handle: '@sarahcode',
    bio: 'Just another tech enthusiast. Coffee addict.',
    avatar: '',
    isFollowing: false
  },
  {
    id: 'u4',
    username: 'Max Design',
    handle: '@maxdesign',
    bio: 'UI/UX Designer striving for pixel perfection.',
    avatar: '',
    isFollowing: true
  }
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 600);
  }, []);

  const toggleFollow = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing } 
        : user
    ));
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="users-container animate-fade-in">
      <div className="users-header">
        <h2>Discover Users</h2>
        <div className="search-bar glass-panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by name or handle..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Finding people...</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="user-card glass-panel">
                <Link to={`/profile/${user.id}`} className="user-card-header">
                  <div className="user-avatar" style={{ backgroundImage: `url(${user.avatar})` }}>
                    {!user.avatar && user.username.charAt(0)}
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.username}</h3>
                    <span className="user-handle">{user.handle}</span>
                  </div>
                </Link>
                <p className="user-bio">{user.bio}</p>
                <button 
                  className={`btn-primary follow-btn-full ${user.isFollowing ? 'following' : ''}`}
                  onClick={() => toggleFollow(user.id)}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">No users found matching "{searchQuery}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
