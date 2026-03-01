import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
// Reuse auth styles
import './Register.css';
import { api } from '../../services/api';


const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const newError = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.username) {
      newError.username = "Username is required";
    }

    if (!formData.email) {
      newError.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newError.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newError.password = "Password is required";
    } else if (formData.password.length < 6) {
      newError.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      newError.password = "Password must include lowercase, uppercase, number, and special character";
    }

    if (!formData.confirmPassword) {
      newError.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newError.confirmPassword = "Passwords don't match";
    }

    setError(newError);

    // Stop submission if validation failed
    if (newError.username || newError.email || newError.password || newError.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
     await api.register(formData);
      // On success, redirect to feed
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message === 'Email already in use') {
        setError({ ...error, email: 'Email is already registered' });
      } else {
        setError({ ...error, general: err.message || 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join SocialVibe today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Your username"
            />
            {error.username && <span className="error-text">{error.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@example.com"
            />
            {error.email && <span className="error-text">{error.email}</span>}
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
            {error.password && <span className="error-text">{error.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="••••••••"
            />
            {error.confirmPassword && <span className="error-text">{error.confirmPassword}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary auth-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
