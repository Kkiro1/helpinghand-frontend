import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonorHome.css';

const DonorHome = () => {
    const navigate = useNavigate();
    const [donorName, setDonorName] = useState('User'); // Default fallback
    const [userEmail, setUserEmail] = useState('');

    const [totalDonations, setTotalDonations] = useState(0);
    const [recentDonations, setRecentDonations] = useState([]);

    useEffect(() => {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            if (userData.name) {
                setDonorName(userData.name);
            } else if (userData.email) {
                // Fallback to email username if no name
                setDonorName(userData.email.split('@')[0]);
            }
            if (userData.email) {
                setUserEmail(userData.email);
            }

            // Update total donations from localStorage
            if (userData.totalDonations) {
                setTotalDonations(userData.totalDonations);
            }
        }

        // Load recent donations from localStorage
        const savedDonations = JSON.parse(localStorage.getItem('donations') || '[]');
        if (savedDonations.length > 0) {
            // Map donations to match the expected format
            const formattedDonations = savedDonations.slice(0, 5).map(donation => ({
                id: donation.id,
                organization: donation.campaignTitle || donation.organization,
                amount: donation.amount,
                date: donation.date,
                status: donation.status || 'Completed'
            }));
            setRecentDonations(formattedDonations);
        }
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleNewDonation = () => {
        // Navigate to campaigns page to choose a campaign
        navigate('/campaigns');
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('userData');
        // In a real app, this would also clear auth tokens
        navigate('/login');
    };

    return (
        <div className="donor-home">
            {/* Header */}
            <header className="donor-header">
                <div className="header-container">
                    <div className="header-left">
                        <div className="logo-section">
                            <span className="material-symbols-outlined logo-icon">volunteer_activism</span>
                            <h1 className="logo-text">HelpingHand</h1>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="material-symbols-outlined user-icon">account_circle</span>
                            <span className="user-name">Welcome, {donorName}</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <span className="material-symbols-outlined">logout</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="donor-main">
                <div className="donor-content">
                    {/* Page Title */}
                    <div className="page-header">
                        <h2 className="page-title">Dashboard</h2>
                        <p className="page-subtitle">Track your donations and make a difference</p>
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="stats-grid">
                        <div className="stats-card primary-card">
                            <div className="stats-card-content">
                                <div className="stats-icon-wrapper">
                                    <span className="material-symbols-outlined stats-icon">payments</span>
                                </div>
                                <div className="stats-info">
                                    <p className="stats-label">Total Donations</p>
                                    <p className="stats-value">{formatCurrency(totalDonations)}</p>
                                    <p className="stats-description">All time contributions</p>
                                </div>
                            </div>
                            <div className="stats-card-decoration"></div>
                        </div>
                        <div className="stats-card secondary-card">
                            <div className="stats-card-content">
                                <div className="stats-icon-wrapper">
                                    <span className="material-symbols-outlined stats-icon">volunteer_activism</span>
                                </div>
                                <div className="stats-info">
                                    <p className="stats-label">Total Campaigns</p>
                                    <p className="stats-value">{recentDonations.length}</p>
                                    <p className="stats-description">Campaigns supported</p>
                                </div>
                            </div>
                            <div className="stats-card-decoration"></div>
                        </div>
                        <div className="stats-card accent-card">
                            <div className="stats-card-content">
                                <div className="stats-icon-wrapper">
                                    <span className="material-symbols-outlined stats-icon">trending_up</span>
                                </div>
                                <div className="stats-info">
                                    <p className="stats-label">This Month</p>
                                    <p className="stats-value">
                                        {formatCurrency(
                                            recentDonations
                                                .filter(d => {
                                                    const dDate = new Date(d.date);
                                                    const now = new Date();
                                                    return dDate.getMonth() === now.getMonth() &&
                                                        dDate.getFullYear() === now.getFullYear();
                                                })
                                                .reduce((sum, d) => sum + d.amount, 0)
                                        )}
                                    </p>
                                    <p className="stats-description">Monthly contributions</p>
                                </div>
                            </div>
                            <div className="stats-card-decoration"></div>
                        </div>
                    </div>

                    {/* Recent Donations Section */}
                    <div className="donations-section">
                        <div className="section-header">
                            <h3 className="section-title">Recent Donations</h3>
                            <button className="view-all-btn" onClick={() => navigate('/donation-history')}>
                                View All
                            </button>
                        </div>

                        <div className="donations-list">
                            {recentDonations.length > 0 ? (
                                recentDonations.map((donation) => (
                                    <div key={donation.id} className="donation-card">
                                        <div className="donation-card-glow"></div>
                                        <div className="donation-card-header">
                                            <div className="donation-org-info">
                                                <div className="donation-icon-wrapper">
                                                    <span className="material-symbols-outlined donation-icon">volunteer_activism</span>
                                                </div>
                                                <div>
                                                    <h4 className="donation-org-name">{donation.organization}</h4>
                                                    <p className="donation-date">
                                                        <span className="material-symbols-outlined date-icon">calendar_today</span>
                                                        {formatDate(donation.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="donation-amount-wrapper">
                                                <div className="donation-amount">{formatCurrency(donation.amount)}</div>
                                                <span className={`donation-status ${donation.status.toLowerCase()}`}>
                                                    {donation.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <span className="material-symbols-outlined empty-icon">inbox</span>
                                    <p>No donations yet</p>
                                    <p className="empty-subtitle">Start making a difference today!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Donation Button */}
                    <div className="action-section">
                        <button className="new-donation-btn" onClick={handleNewDonation}>
                            <span className="material-symbols-outlined">add_circle</span>
                            <span>Start New Donation</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DonorHome;

