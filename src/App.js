
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DonorHome from './pages/DonorHome';
import Campaigns from './pages/Campaigns';
import Donate from './pages/Donate';
import DonationHistory from './pages/DonationHistory';
import OrganizationDashboard from './OrganizationDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/donor-home" element={<DonorHome />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/donate/:campaignId" element={<Donate />} />
          <Route path="/donation-history" element={<DonationHistory />} />
          <Route path="/organization" element={<OrganizationDashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
