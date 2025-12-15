import React, { useState } from 'react';
import './OrganizationDashboard.css';

const INITIAL_CAMPAIGNS = [
  { id: 1, title: 'Winter Clothes Drive', description: 'Collecting coats for the homeless', goal: '500 Coats', status: 'Active', donors: 12, duration: 'Dec 1 - Jan 30' },
  { id: 2, title: 'Food Bank Restock', description: 'Canned goods needed', goal: '1000 Cans', status: 'Completed', donors: 45, duration: 'Nov 1 - Nov 30' },
];

const INITIAL_DONATIONS = [
  { id: 101, donor: 'John Doe', item: '5 Winter Jackets', description: 'Gently used, large sizes', campaignId: 1, status: 'Pending' },
  { id: 102, donor: 'Sarah Smith', item: 'Box of Pasta', description: '20 packs of spaghetti', campaignId: 2, status: 'Approved' },
  { id: 103, donor: 'Mike Ross', item: 'Torn Blankets', description: 'Old wool blankets', campaignId: 1, status: 'Rejected' },
];

const INITIAL_PROFILE = {
  name: 'Helping Hand Foundation',
  address: '123 Charity Lane, Cairo',
  phone: '+20 123 456 7890',
  email: 'contact@helpinghand.org',
  password: 'password123',
  description: 'Dedicated to connecting donors with those in need.'
};

export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [donations, setDonations] = useState(INITIAL_DONATIONS);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', goal: '', duration: '', notes: '' });

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.goal) return alert("Title and Goal are required!");
    
    const campaign = {
      id: Date.now(),
      ...newCampaign,
      status: 'Active',
      donors: 0
    };
    
    setCampaigns([campaign, ...campaigns]);
    setNewCampaign({ title: '', description: '', goal: '', duration: '', notes: '' }); 
    alert("Campaign Created Successfully!");
  };

  const handleDonationAction = (id, newStatus) => {
    setDonations(donations.map(d => 
      d.id === id ? { ...d, status: newStatus } : d
    ));
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#f59e0b';
      case 'Approved': return '#10b981';
      case 'Delivered': return '#3b82f6';
      case 'Rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCampaignTitle = (id) => {
    const camp = campaigns.find(c => c.id === id);
    return camp ? camp.title : 'General Donation';
  };

  const getTopCampaign = () => {
    if (campaigns.length === 0) return "None";
    return campaigns.reduce((prev, current) => (prev.donors > current.donors) ? prev : current).title;
  };

  const DashboardView = () => (
    <div className="org-grid">
      <div className="org-card">
        <h3>Total Donations Received</h3>
        <p className="org-big-number">{donations.length}</p>
      </div>
      <div className="org-card">
        <h3>Total Active Campaigns</h3>
        <p className="org-big-number">{campaigns.filter(c => c.status === 'Active').length}</p>
      </div>
      <div className="org-card">
        <h3>Most Successful Campaign</h3>
        <p className="org-big-number" style={{fontSize: '1.5rem', marginTop: '15px'}}>
          {getTopCampaign()}
        </p>
      </div>
    </div>
  );

  const CampaignsView = () => (
    <div>
      <div className="org-card" style={{ marginBottom: '2rem' }}>
        <h3>Create New Campaign</h3>
        <form onSubmit={handleCreateCampaign} className="org-form">
          <input className="org-input" placeholder="Campaign Title *" value={newCampaign.title} onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})} />
          
          <div style={{display: 'flex', gap: '10px'}}>
            <input className="org-input" placeholder="Goal (e.g., 50 Blankets) *" value={newCampaign.goal} onChange={(e) => setNewCampaign({...newCampaign, goal: e.target.value})} />
            <input className="org-input" placeholder="Duration (Optional)" value={newCampaign.duration} onChange={(e) => setNewCampaign({...newCampaign, duration: e.target.value})} />
          </div>

          <textarea className="org-textarea" placeholder="Description..." value={newCampaign.description} onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})} />
          <input className="org-input" placeholder="Extra Notes (Optional)" value={newCampaign.notes} onChange={(e) => setNewCampaign({...newCampaign, notes: e.target.value})} />
          
          <button type="submit" className="btn btn-primary">Launch Campaign</button>
        </form>
      </div>

      <h3>Your Campaigns</h3>
      <div className="org-grid">
        {campaigns.map(camp => (
          <div key={camp.id} className="org-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{camp.title}</strong>
              <span className="status-badge" style={{ backgroundColor: camp.status === 'Active' ? '#10b981' : '#9ca3af' }}>{camp.status}</span>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{camp.description}</p>
            {camp.duration && <p style={{fontSize: '0.8rem', color: '#888'}}>Duration: {camp.duration}</p>}
            <small>Goal: {camp.goal} • Donors: {camp.donors}</small>
          </div>
        ))}
      </div>
    </div>
  );

  const DonationsView = () => (
    <div>
      <h3>Incoming Donations</h3>
      <div className="org-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="org-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Item / Campaign</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(d => (
              <tr key={d.id}>
                <td>{d.donor}</td>
                <td>
                  <strong>{d.item}</strong>
                  <br/>
                  <span style={{fontSize:'0.8rem', color:'#3b82f6'}}>For: {getCampaignTitle(d.campaignId)}</span>
                  <br/>
                  <small style={{color:'#666'}}>{d.description}</small>
                </td>
                <td><span className="status-badge" style={{ backgroundColor: getStatusColor(d.status) }}>{d.status}</span></td>
                <td>
                  {d.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn btn-success" onClick={() => handleDonationAction(d.id, 'Approved')}>Accept</button>
                      <button className="btn btn-danger" onClick={() => handleDonationAction(d.id, 'Rejected')}>Reject</button>
                    </div>
                  )}
                  {d.status === 'Approved' && <button className="btn btn-primary" style={{fontSize: '0.8rem'}} onClick={() => handleDonationAction(d.id, 'Delivered')}>Mark Delivered</button>}
                  {(d.status === 'Rejected' || d.status === 'Delivered') && <span style={{color: '#999', fontSize: '0.8rem'}}>Archived</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="org-card" style={{ maxWidth: '600px' }}>
      <h3>Organization Profile</h3>
      <div className="org-form">
        <label>Organization Name</label>
        <input className="org-input" name="name" value={profile.name} onChange={handleProfileChange} />
        
        <label>Address</label>
        <input className="org-input" name="address" value={profile.address} onChange={handleProfileChange} />
        
        <label>Phone</label>
        <input className="org-input" name="phone" value={profile.phone} onChange={handleProfileChange} />
        
        <label>Email Address</label>
        <input className="org-input" name="email" value={profile.email} onChange={handleProfileChange} />
        
        <label>Password</label>
        <input className="org-input" name="password" type="password" value={profile.password} onChange={handleProfileChange} />

        <label>Description</label>
        <textarea className="org-textarea" name="description" value={profile.description} onChange={handleProfileChange} />
        
        <button className="btn btn-primary" onClick={() => alert("Profile Saved Successfully!")}>Save Changes</button>
      </div>
    </div>
  );

  return (
    <div className="org-container">
      <aside className="org-sidebar">
        <h2>Org. Panel</h2>
        <nav className="org-nav">
          <button className={`org-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`org-nav-btn ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>Campaigns</button>
          <button className={`org-nav-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>Donations</button>
          <button className={`org-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        </nav>
      </aside>

      <main className="org-main">
        <header className="org-header">
          <h1 style={{margin:0}}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <span>Welcome, {profile.name}</span>
        </header>
        <div className="org-content">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'campaigns' && <CampaignsView />}
          {activeTab === 'donations' && <DonationsView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}