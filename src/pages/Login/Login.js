import React, { useState } from 'react';
import { Link } from 'react-router';
import './Login.css';
import { api } from '../../services/api';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState({email: '', password: ''});
  const [loading, setLoading] = useState(false);

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

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BASE_URL}/auth/google`;
    localStorage.setItem('isLoggedIn', 'true'); // Set auth state in localStorage
  };

  return (
    <div
      style={{ height: location.pathname === "/login" ? "100vh" : "100%" }}
      className="auth-container"
    >
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
            {error.email && (
              <span className="error-message">{error.email}</span>
            )}
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
            {error.password && (
              <span className="error-message">{error.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`btn-primary auth-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="google-btn">
          <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Google
        </button>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
