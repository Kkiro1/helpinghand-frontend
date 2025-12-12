import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Campaigns.css';

const Campaigns = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [campaigns] = useState([
    {
      id: 1,
      title: 'Children\'s Education Fund',
      description: 'Support education for underprivileged children in rural areas. Help us provide books, supplies, and scholarships.',
      category: 'Education',
      goal: 50000,
      raised: 32500,
      donors: 245,
      image: '📚',
      deadline: '2024-03-15',
      organization: 'Education for All Foundation'
    },
    {
      id: 2,
      title: 'Food Bank Network',
      description: 'Feed families in need. Your donation helps provide nutritious meals to thousands of families every month.',
      category: 'Food',
      goal: 75000,
      raised: 48200,
      donors: 389,
      image: '🍽️',
      deadline: '2024-04-01',
      organization: 'Community Food Bank'
    },
    {
      id: 3,
      title: 'Medical Relief Foundation',
      description: 'Provide medical care and supplies to communities without access to healthcare facilities.',
      category: 'Health',
      goal: 100000,
      raised: 67800,
      donors: 512,
      image: '🏥',
      deadline: '2024-05-20',
      organization: 'Global Health Initiative'
    },
    {
      id: 4,
      title: 'Homeless Shelter Support',
      description: 'Help us provide shelter, food, and support services to homeless individuals and families.',
      category: 'Shelter',
      goal: 60000,
      raised: 28900,
      donors: 178,
      image: '🏠',
      deadline: '2024-03-30',
      organization: 'Hope Shelter Network'
    },
    {
      id: 5,
      title: 'Animal Rescue Center',
      description: 'Rescue, rehabilitate, and find homes for abandoned and abused animals.',
      category: 'Animals',
      goal: 30000,
      raised: 15200,
      donors: 134,
      image: '🐾',
      deadline: '2024-04-15',
      organization: 'Paws & Claws Rescue'
    },
    {
      id: 6,
      title: 'Clean Water Initiative',
      description: 'Bring clean, safe drinking water to communities in need. Every dollar helps provide water wells and filtration systems.',
      category: 'Environment',
      goal: 80000,
      raised: 45600,
      donors: 298,
      image: '💧',
      deadline: '2024-06-01',
      organization: 'Water for Life'
    }
  ]);

  const categories = ['all', 'Education', 'Food', 'Health', 'Shelter', 'Animals', 'Environment'];

  const handleCampaignClick = (campaignId) => {
    navigate(`/donate/${campaignId}`);
  };

  const handleBack = () => {
    navigate('/donor-home');
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="campaigns-page">
      <header className="campaigns-header">
        <div className="header-container">
          <button className="back-btn" onClick={handleBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="page-title">Browse Campaigns</h1>
        </div>
      </header>

      <main className="campaigns-main">
        <div className="campaigns-content">
          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-box">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-filter">
              <label className="filter-label">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="campaigns-grid">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(campaign => {
                const progress = calculateProgress(campaign.raised, campaign.goal);
                return (
                  <div
                    key={campaign.id}
                    className="campaign-card"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    <div className="campaign-image">
                      <span className="campaign-emoji">{campaign.image}</span>
                    </div>
                    <div className="campaign-content">
                      <div className="campaign-header">
                        <span className="campaign-category">{campaign.category}</span>
                        <span className="campaign-deadline">
                          <span className="material-symbols-outlined">schedule</span>
                          {new Date(campaign.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="campaign-title">{campaign.title}</h3>
                      <p className="campaign-org">{campaign.organization}</p>
                      <p className="campaign-description">{campaign.description}</p>
                      
                      <div className="campaign-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="progress-stats">
                          <span className="progress-raised">{formatCurrency(campaign.raised)}</span>
                          <span className="progress-goal">of {formatCurrency(campaign.goal)}</span>
                        </div>
                      </div>

                      <div className="campaign-footer">
                        <div className="campaign-donors">
                          <span className="material-symbols-outlined">people</span>
                          <span>{campaign.donors} donors</span>
                        </div>
                        <button className="donate-btn-card">
                          Donate Now
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-campaigns">
                <span className="material-symbols-outlined">search_off</span>
                <p>No campaigns found</p>
                <p className="no-campaigns-subtitle">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;

