import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DonationHistory.css";

const mapDonation = (d) => {
  const campaignTitle =
    d.campaignTitle ||
    d.campaign_title ||
    d.campaign?.title ||
    d.campaign_name ||
    "Campaign";

  const organization =
    d.organization ||
    d.campaign?.organization ||
    d.org_name ||
    d.owner_username ||
    "";

  const paymentMethod = d.paymentMethod || d.payment_method || "card";
  const status = d.status || "Completed";
  const date =
    d.date || d.created_at || d.createdAt || new Date().toISOString();

  return {
    id: d.id ?? `${campaignTitle}-${date}`,
    campaignTitle,
    organization,
    amount: Number(d.amount) || 0,
    date,
    paymentMethod,
    isAnonymous: !!(d.isAnonymous ?? d.is_anonymous),
    status,
  };
};

const DonationHistory = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [totalDonated, setTotalDonated] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDonations = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("auth:access");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("/api/donations/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        localStorage.removeItem("auth:access");
        localStorage.removeItem("auth:refresh");
        localStorage.removeItem("userData");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.detail || data?.message || `HTTP ${res.status}`);
      }

      const list = Array.isArray(data) ? data.map(mapDonation) : [];
      setDonations(list);

      const total = list.reduce((sum, x) => sum + (x.amount || 0), 0);
      setTotalDonated(total);
    } catch (e) {
      setError(e.message || "Couldn't load donations");
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (filter === "all") return true;
    return (
      String(donation.status).toLowerCase() === String(filter).toLowerCase()
    );
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => navigate("/donor-home");
  const handleNewDonation = () => navigate("/campaigns");

  const thisMonthTotal = donations
    .filter((d) => {
      const donationDate = new Date(d.date);
      const now = new Date();
      return (
        donationDate.getMonth() === now.getMonth() &&
        donationDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, d) => sum + (d.amount || 0), 0);

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
          {error && (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">info</span>
              <h3>Couldn't load donations</h3>
              <p className="empty-subtitle">{error}</p>
              <button className="empty-action-btn" onClick={loadDonations}>
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <div className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Total Donations</span>
                  <span className="summary-value">
                    {formatCurrency(totalDonated)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Campaigns</span>
                  <span className="summary-value">{donations.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">This Month</span>
                  <span className="summary-value">
                    {formatCurrency(thisMonthTotal)}
                  </span>
                </div>
              </div>

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
                <button
                  className="new-donation-btn"
                  onClick={handleNewDonation}
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  <span>New Donation</span>
                </button>
              </div>

              <div className="donations-section">
                {loading ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined empty-icon">
                      sync
                    </span>
                    <h3>Loading...</h3>
                  </div>
                ) : filteredDonations.length > 0 ? (
                  <div className="donations-list">
                    {filteredDonations.map((donation) => (
                      <div key={donation.id} className="donation-item">
                        <div className="donation-item-header">
                          <div className="donation-campaign-info">
                            <div className="donation-icon-wrapper">
                              <span className="material-symbols-outlined donation-icon">
                                volunteer_activism
                              </span>
                            </div>
                            <div>
                              <h3 className="donation-campaign-title">
                                {donation.campaignTitle}
                              </h3>
                              <p className="donation-organization">
                                {donation.organization}
                              </p>
                              <p className="donation-date">
                                {formatDate(donation.date)}
                              </p>
                            </div>
                          </div>
                          <div className="donation-amount-large">
                            {formatCurrency(donation.amount)}
                          </div>
                        </div>

                        <div className="donation-item-footer">
                          <div className="donation-meta">
                            <span
                              className={`donation-status ${String(
                                donation.status
                              ).toLowerCase()}`}
                            >
                              {donation.status}
                            </span>

                            <span className="donation-payment-method">
                              <span className="material-symbols-outlined">
                                payment
                              </span>
                              {donation.paymentMethod === "card"
                                ? "Credit/Debit Card"
                                : "PayPal"}
                            </span>

                            {donation.isAnonymous && (
                              <span className="anonymous-badge">
                                <span className="material-symbols-outlined">
                                  visibility_off
                                </span>
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
                    <span className="material-symbols-outlined empty-icon">
                      inbox
                    </span>
                    <h3>No donations found</h3>
                    <p className="empty-subtitle">
                      {filter === "all"
                        ? "You haven't made any donations yet. Start making a difference today!"
                        : `No ${filter} donations found.`}
                    </p>
                    {filter === "all" && (
                      <button
                        className="empty-action-btn"
                        onClick={handleNewDonation}
                      >
                        Make Your First Donation
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DonationHistory;
