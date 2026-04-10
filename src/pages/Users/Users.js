import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import './Users.css';
import { api } from '../../services/api';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const res = await api.getAllUsers();
      setUsers(res);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const debounceTimers = useRef({});
  const initialFollowStates = useRef({}); // Tracks the true backend state before a flurry of clicks

  const toggleFollow = (userId) => {
    const userToToggle = users.find(u => u._id === userId);
    if (!userToToggle) return;

    const currentUIState = userToToggle.isFollowing;
    const nextState = !currentUIState;

    // Record the initial state if this is the first click in a rapid sequence
    if (initialFollowStates.current[userId] === undefined) {
      initialFollowStates.current[userId] = currentUIState;
    }

    // Optimistic UI update
    setUsers(prevUsers => prevUsers.map(user => 
      user._id === userId 
        ? { ...user, isFollowing: nextState } 
        : user
    ));

    // Clear existing timer for this user
    if (debounceTimers.current[userId]) {
      clearTimeout(debounceTimers.current[userId]);
    }

    // Set new timer
    debounceTimers.current[userId] = setTimeout(async () => {
      const initialState = initialFollowStates.current[userId];
      
      // Clean up our refs
      delete initialFollowStates.current[userId];
      delete debounceTimers.current[userId];

      // If the final intended state matches the initial true state, the net change is zero. Skip API call.
      if (initialState === nextState) {
        return; 
      }

      try {
        await api.toggleFollow(userId);
        const res = await api.getLoggedInUser();
        localStorage.setItem('LoggedInuserDetails', JSON.stringify(res));
      } catch (error) {
        console.error('Error toggling follow status:', error);
        // Revert optimistic update on failure back to the original true state
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: initialState } 
            : user
        ));
      }
    }, 500); // 500ms debounce
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div key={user._id} className="user-card glass-panel">
                <Link to={`/profile/${user._id}`} className="user-card-header">
                  <div className="user-avatar" style={{ backgroundImage: `url(${user.userAvatar})` }}>
                    {!user.userAvatar && user.username.charAt(0)}
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <span className="user-handle">{`@${user.username}`}</span>
                  </div>
                </Link>
                <p className="user-bio">{user.bio}</p>
                <button 
                  className={`btn-primary follow-btn-full ${user.isFollowing ? 'following' : ''}`}
                  onClick={() => toggleFollow(user._id)}
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
