import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    terms: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleRoleChange = (value) => {
    setRole(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!role) {
      setError('Please select how you would like to participate');
      return;
    }

    if (!formData.terms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Here you would typically make an API call to register
    console.log('Signup attempt:', { ...formData, role });

    // Store user data in localStorage (in a real app, this would come from API response)
    const userData = {
      name: formData.fullName,
      email: formData.email,
      role: role,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    // Simulate successful signup
    alert(`Account created successfully as ${role}!`);

    // Navigate based on role
    if (role === 'donor' || role === 'both') {
      navigate('/donor-home');
    } else {
      navigate('/login');
    }
  };

  const roleOptions = [
    { id: 'donor', label: 'I want to Donate', icon: 'volunteer_activism' },
    { id: 'recipient', label: 'I need Help', icon: 'pan_tool' },
    { id: 'both', label: 'Both', icon: 'handshake' },
  ];

  return (
    <div className="signup-container">
      <header className="signup-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="material-symbols-outlined">volunteer_activism</span>
            </div>
            <h2 className="logo-text">HelpingHand</h2>
          </div>
          <div className="header-actions">
            <span className="header-text">Already have an account?</span>
            <Link to="/login" className="header-link">
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="signup-main">
        <div className="signup-content">
          <div className="signup-header-section">
            <h1 className="signup-title">Join Our Community</h1>
            <p className="signup-subtitle">
              Give support or get support. Your journey starts here.
            </p>
          </div>

          {/* Social Sign-up */}
          <div className="social-signup-section">
            <button className="social-btn google-btn" type="button">
              <img
                className="social-icon"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              <span>Sign up with Google</span>
            </button>
            <button className="social-btn facebook-btn" type="button">
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Sign up with Facebook</span>
            </button>
          </div>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          {/* Signup Form */}
          <form className="signup-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

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

            {/* Role Selection */}
            <fieldset className="role-fieldset">
              <legend className="role-legend">
                How would you like to participate?
              </legend>
              <div className="role-options">
                {roleOptions.map((r) => (
                  <label
                    key={r.id}
                    className={`role-option ${role === r.id ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      className="role-radio"
                      checked={role === r.id}
                      onChange={() => handleRoleChange(r.id)}
                    />
                    <div className="role-content">
                      <span className="material-symbols-outlined role-icon">
                        {r.icon}
                      </span>
                      <span className="role-label">{r.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Terms */}
            <div className="terms-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  checked={formData.terms}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="terms-text">
                  I agree to the{' '}
                  <Link to="#" className="terms-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="terms-link">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Signup;


