import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/signup');
    };

    return (
        <div className="home-page">
            {/* Navigation Header */}
            <header className="home-header">
                <div className="header-container">
                    <div className="logo-section">
                        <span className="material-symbols-outlined logo-icon">volunteer_activism</span>
                        <h1 className="logo-text">HelpingHand</h1>
                    </div>
                    <nav className="nav-links">
                        <Link to="/donor-home" className="nav-link">Dashboard</Link>
                        <Link to="/signup" className="nav-link">Sign Up</Link>
                        <Link to="/login" className="nav-link login-link">Log In</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section with Image */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h2 className="hero-welcome">Welcome to HelpingHand</h2>
                        <h1 className="hero-title">Make a Difference, One Donation at a Time</h1>
                        <p className="hero-description">
                            Join thousands of donors making a positive impact in communities around the world.
                            Your generosity helps provide education, food, healthcare, and shelter to those in need.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={handleGetStarted}>
                                Get Started
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <Link to="/campaigns" className="btn-secondary">
                                Browse Campaigns
                            </Link>
                            
                            {/* ✅ NEW BUTTON ADDED HERE */}
                            <Link to="/organization">
                                <button style={{ 
                                    padding: '12px 24px', 
                                    fontSize: '16px', 
                                    backgroundColor: 'transparent', 
                                    color: 'white', 
                                    border: '2px solid white', 
                                    borderRadius: '30px', 
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginLeft: '15px',
                                    transition: '0.3s'
                                }}>
                                    Org Dashboard
                                </button>
                            </Link>

                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-container">
                    <h2 className="section-title">Why Choose HelpingHand?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                            <h3 className="feature-title">Verified Campaigns</h3>
                            <p className="feature-description">
                                All campaigns are verified to ensure your donations reach those who need it most.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">security</span>
                            </div>
                            <h3 className="feature-title">Secure Donations</h3>
                            <p className="feature-description">
                                Your payment information is protected with industry-standard encryption.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">track_changes</span>
                            </div>
                            <h3 className="feature-title">Track Impact</h3>
                            <p className="feature-description">
                                See exactly how your donations are making a difference with detailed reports.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <h3 className="feature-title">Join a Community</h3>
                            <p className="feature-description">
                                Connect with like-minded individuals committed to making the world a better place.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3 className="stat-number">$2.5M+</h3>
                        <p className="stat-label">Raised</p>
                    </div>
                    <div className="stat-item">
                        <h3 className="stat-number">15K+</h3>
                        <p className="stat-label">Donors</p>
                    </div>
                    <div className="stat-item">
                        <h3 className="stat-number">500+</h3>
                        <p className="stat-label">Campaigns</p>
                    </div>
                    <div className="stat-item">
                        <h3 className="stat-number">50+</h3>
                        <p className="stat-label">Countries</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2 className="cta-title">Ready to Make an Impact?</h2>
                    <p className="cta-description">
                        Join HelpingHand today and start making a difference in the lives of those in need.
                    </p>
                    <button className="cta-button" onClick={handleGetStarted}>
                        Create Your Account
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4 className="footer-title">HelpingHand</h4>
                            <p className="footer-text">Making a difference, one donation at a time.</p>
                        </div>
                        <div className="footer-section">
                            <h4 className="footer-title">Quick Links</h4>
                            <Link to="/campaigns" className="footer-link">Campaigns</Link>
                            <Link to="/donor-home" className="footer-link">Dashboard</Link>
                            <Link to="/signup" className="footer-link">Sign Up</Link>
                        </div>
                        <div className="footer-section">
                            <h4 className="footer-title">Support</h4>
                            <Link to="#" className="footer-link">About Us</Link>
                            <Link to="#" className="footer-link">Contact</Link>
                            <Link to="#" className="footer-link">FAQ</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 HelpingHand. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;