import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import '../Login/Login.css'; // Reusing auth styles
import { api } from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(newPassword)) {
      setError('Password must include lowercase, uppercase, number, and special character');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.resetPassword(token, newPassword);
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <h2>Create New Password</h2>
          <p>Enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input 
              id="newPassword" 
              name="newPassword"
              type="password"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword" 
              name="confirmPassword"
              type="password"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
            />
            {error && <span className="error-message">{error}</span>}
            {message && <span style={{ color: 'var(--primary-color)', marginTop: '5px' }}>{message}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary auth-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Back to <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
