import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonationHistory.css';

const DonationHistory = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = () => {
    const savedDonations = JSON.parse(localStorage.getItem('donations') || '[]');
    setDonations(savedDonations);
    
    // Calculate total
    const total = savedDonations.reduce((sum, donation) => sum + donation.amount, 0);
    setTotalDonated(total);
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.status.toLowerCase() === filter.toLowerCase();
  });

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    navigate('/donor-home');
  };

  const handleNewDonation = () => {
    navigate('/campaigns');
  };

  return (
    <div className="donation-history-page">
      <header className="history-header">
        <div className="header-container">
          <button className="back-btn" onClick={handleBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="page-title">Donation History</h1>
        </div>
      </header>

      <main className="history-main">
        <div className="history-content">
          {/* Summary Card */}
          <div className="summary-card">
            <div className="summary-item">
              <span className="summary-label">Total Donations</span>
              <span className="summary-value">{formatCurrency(totalDonated)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Campaigns</span>
              <span className="summary-value">{donations.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">This Month</span>
              <span className="summary-value">
                {formatCurrency(
                  donations
                    .filter(d => {
                      const donationDate = new Date(d.date);
                      const now = new Date();
                      return donationDate.getMonth() === now.getMonth() &&
                             donationDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, d) => sum + d.amount, 0)
                )}
              </span>
            </div>
          </div>

          {/* Filter and Actions */}
          <div className="history-actions">
            <div className="filter-section">
              <label className="filter-label">Filter by status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Donations</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <button className="new-donation-btn" onClick={handleNewDonation}>
              <span className="material-symbols-outlined">add_circle</span>
              <span>New Donation</span>
            </button>
          </div>

          {/* Donations List */}
          <div className="donations-section">
            {filteredDonations.length > 0 ? (
              <div className="donations-list">
                {filteredDonations.map((donation) => (
                  <div key={donation.id} className="donation-item">
                    <div className="donation-item-header">
                      <div className="donation-campaign-info">
                        <div className="donation-icon-wrapper">
                          <span className="material-symbols-outlined donation-icon">volunteer_activism</span>
                        </div>
                        <div>
                          <h3 className="donation-campaign-title">{donation.campaignTitle}</h3>
                          <p className="donation-organization">{donation.organization}</p>
                          <p className="donation-date">{formatDate(donation.date)}</p>
                        </div>
                      </div>
                      <div className="donation-amount-large">{formatCurrency(donation.amount)}</div>
                    </div>
                    <div className="donation-item-footer">
                      <div className="donation-meta">
                        <span className={`donation-status ${donation.status.toLowerCase()}`}>
                          {donation.status}
                        </span>
                        <span className="donation-payment-method">
                          <span className="material-symbols-outlined">payment</span>
                          {donation.paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                        </span>
                        {donation.isAnonymous && (
                          <span className="anonymous-badge">
                            <span className="material-symbols-outlined">visibility_off</span>
                            Anonymous
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon">inbox</span>
                <h3>No donations found</h3>
                <p className="empty-subtitle">
                  {filter === 'all' 
                    ? "You haven't made any donations yet. Start making a difference today!"
                    : `No ${filter} donations found.`}
                </p>
                {filter === 'all' && (
                  <button className="empty-action-btn" onClick={handleNewDonation}>
                    Make Your First Donation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonationHistory;

