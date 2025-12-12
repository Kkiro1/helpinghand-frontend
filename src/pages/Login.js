import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('donor');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Here you would typically make an API call to authenticate
    console.log('Login attempt:', { ...formData, userType });

    // In a real app, you'd get user data from API response
    // For now, we'll check localStorage or use email as fallback
    let userData = JSON.parse(localStorage.getItem('userData')) || {};

    // Update user data with current login info
    userData = {
      ...userData,
      email: formData.email,
      role: userType,
      loginTime: new Date().toISOString()
    };

    // If no name exists, use email username part as fallback
    if (!userData.name) {
      userData.name = formData.email.split('@')[0];
    }

    localStorage.setItem('userData', JSON.stringify(userData));

    // Navigate based on user type
    if (userType === 'donor') {
      navigate('/donor-home');
    } else if (userType === 'recipient') {
      // Navigate to recipient home when created
      navigate('/donor-home'); // Temporary - replace with recipient home
    } else if (userType === 'organization') {
      // Navigate to organization home when created
      navigate('/donor-home'); // Temporary - replace with organization home
    } else {
      navigate('/donor-home');
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="material-symbols-outlined">volunteer_activism</span>
            </div>
            <h2 className="logo-text">HelpingHand</h2>
          </div>
          <div className="header-actions">
            <span className="header-text">Don't have an account?</span>
            <Link to="/signup" className="header-link">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="login-content">
          <div className="login-header-section">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to continue to HelpingHand
            </p>
          </div>

          {/* User Type Selection */}
          <div className="user-type-section">
            <label className="user-type-label">
              I am a:
            </label>
            <div className="user-type-options">
              <button
                type="button"
                className={`user-type-btn ${userType === 'donor' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('donor')}
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                <span>Donor</span>
              </button>
              <button
                type="button"
                className={`user-type-btn ${userType === 'recipient' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('recipient')}
              >
                <span className="material-symbols-outlined">pan_tool</span>
                <span>Recipient</span>
              </button>
              <button
                type="button"
                className={`user-type-btn ${userType === 'organization' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('organization')}
              >
                <span className="material-symbols-outlined">business</span>
                <span>Organization</span>
              </button>
            </div>
          </div>

          {/* Social Login */}
          <div className="social-login-section">
            <button className="social-btn google-btn" type="button">
              <img
                className="social-icon"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              <span>Continue with Google</span>
            </button>
            <button className="social-btn facebook-btn" type="button">
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" />
                <span>Remember me</span>
              </label>
              <Link to="#" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;


