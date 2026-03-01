import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import './Login.css';
import { api } from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState({email: '', password: ''});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Validate form data
    const newError = { email: '', password: '' };

    if (!formData.email) {
      newError.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newError.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newError.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newError.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      newError.password = 'Password must include lowercase, uppercase, number, and special character';
    }

    setError(newError);

    // Stop submission if validation failed
    if (newError.email || newError.password) return;

    setLoading(true);

    try {
      await api.login(formData);
      localStorage.setItem('isLoggedIn', 'true'); // Set auth state in localStorage
      window.location.href = "/";
    } catch (err) {
      console.error('Login error:', err);
      setError({ ...error, general: err.message || 'An error occurred. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to SocialVibe</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@example.com"
            />
            {error.email && <span className="error-message">{error.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
            />
            {error.password && <span className="error-message">{error.password}</span>}
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary auth-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
