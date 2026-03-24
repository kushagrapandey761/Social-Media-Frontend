import React, { useState } from 'react';
import { Link } from 'react-router';
import '../Login/Login.css'; // Reusing auth styles
import { api } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setMessage('Password reset link sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <h2>Restore Access</h2>
          <p>Enter your email to reset password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email"
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
            />
            {error && <span className="error-message">{error}</span>}
            {message && <span style={{ color: 'var(--primary-color)', marginTop: '5px' }}>{message}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary auth-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
