import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authFetch from "../utils/authFetch";
import "./DonorHome.css";

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

  const status = d.status || "Completed";
  const date =
    d.date || d.created_at || d.createdAt || new Date().toISOString();

  return {
    id: d.id ?? `${campaignTitle}-${date}`,
    campaignTitle,
    organization,
    amount: Number(d.amount) || 0,
    date,
    status,
  };
};

const extractError = async (res) => {
  const data = await res.json().catch(() => null);
  if (!data) return `HTTP ${res.status}`;
  if (typeof data === "string") return data;
  return data.detail || data.message || `HTTP ${res.status}`;
};

const DonorHome = () => {
  const navigate = useNavigate();
  const [donorName, setDonorName] = useState("User");

  const [totalDonations, setTotalDonations] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [recentDonations, setRecentDonations] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    if (userData?.name) setDonorName(userData.name);
    else if (userData?.email) setDonorName(userData.email.split("@")[0]);

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch("/api/donations/");

      if (!res.ok) throw new Error(await extractError(res));

      const data = await res.json().catch(() => null);

      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      const list = rawList.map(mapDonation);

      const total = list.reduce((sum, x) => sum + (x.amount || 0), 0);
      setTotalDonations(total);

      const campaignsSet = new Set(list.map((x) => x.campaignTitle));
      setTotalCampaigns(campaignsSet.size);

      const now = new Date();
      const monthTotal = list
        .filter((d) => {
          const dd = new Date(d.date);
          return (
            dd.getMonth() === now.getMonth() &&
            dd.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      setThisMonthTotal(monthTotal);
      setRecentDonations(list.slice(0, 5));
    } catch (e) {
      if (e?.status === 401) {
        navigate("/login");
        return;
      }
      setError(e.message || "Couldn't load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleNewDonation = () => navigate("/campaigns");

  const handleLogout = () => {
    localStorage.removeItem("auth:access");
    localStorage.removeItem("auth:refresh");
    localStorage.removeItem("auth:user");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <div className="donor-home">
      <header className="donor-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo-section">
              <span className="material-symbols-outlined logo-icon">
                volunteer_activism
              </span>
              <h1 className="logo-text">HelpingHand</h1>
            </div>
          </div>

          <div className="header-right">
            <div className="user-info">
              <span className="material-symbols-outlined user-icon">
                account_circle
              </span>
              <span className="user-name">Welcome, {donorName}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="donor-main">
        <div className="donor-content">
          <div className="page-header">
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">
              Track your donations and make a difference
            </p>
          </div>

          {error && (
            <div className="empty-state" style={{ marginBottom: 16 }}>
              <span className="material-symbols-outlined empty-icon">info</span>
              <p>{error}</p>
              <button className="new-donation-btn" onClick={loadDashboard}>
                Retry
              </button>
            </div>
          )}

          <div className="stats-grid">
            <div className="stats-card primary-card">
              <div className="stats-card-content">
                <div className="stats-icon-wrapper">
                  <span className="material-symbols-outlined stats-icon">
                    payments
                  </span>
                </div>
                <div className="stats-info">
                  <p className="stats-label">Total Donations</p>
                  <p className="stats-value">
                    {formatCurrency(totalDonations)}
                  </p>
                  <p className="stats-description">All time contributions</p>
                </div>
              </div>
              <div className="stats-card-decoration"></div>
            </div>

            <div className="stats-card secondary-card">
              <div className="stats-card-content">
                <div className="stats-icon-wrapper">
                  <span className="material-symbols-outlined stats-icon">
                    volunteer_activism
                  </span>
                </div>
                <div className="stats-info">
                  <p className="stats-label">Total Campaigns</p>
                  <p className="stats-value">{totalCampaigns}</p>
                  <p className="stats-description">Campaigns supported</p>
                </div>
              </div>
              <div className="stats-card-decoration"></div>
            </div>

            <div className="stats-card accent-card">
              <div className="stats-card-content">
                <div className="stats-icon-wrapper">
                  <span className="material-symbols-outlined stats-icon">
                    trending_up
                  </span>
                </div>
                <div className="stats-info">
                  <p className="stats-label">This Month</p>
                  <p className="stats-value">
                    {formatCurrency(thisMonthTotal)}
                  </p>
                  <p className="stats-description">Monthly contributions</p>
                </div>
              </div>
              <div className="stats-card-decoration"></div>
            </div>
          </div>

          <div className="donations-section">
            <div className="section-header">
              <h3 className="section-title">Recent Donations</h3>
              <button
                className="view-all-btn"
                onClick={() => navigate("/donation-history")}
              >
                View All
              </button>
            </div>

            <div className="donations-list">
              {loading ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined empty-icon">
                    sync
                  </span>
                  <p>Loading...</p>
                </div>
              ) : recentDonations.length > 0 ? (
                recentDonations.map((d) => (
                  <div key={d.id} className="donation-card">
                    <div className="donation-card-glow"></div>
                    <div className="donation-card-header">
                      <div className="donation-org-info">
                        <div className="donation-icon-wrapper">
                          <span className="material-symbols-outlined donation-icon">
                            volunteer_activism
                          </span>
                        </div>
                        <div>
                          <h4 className="donation-org-name">
                            {d.campaignTitle}
                          </h4>
                          <p className="donation-date">
                            <span className="material-symbols-outlined date-icon">
                              calendar_today
                            </span>
                            {formatDate(d.date)}
                          </p>
                        </div>
                      </div>

                      <div className="donation-amount-wrapper">
                        <div className="donation-amount">
                          {formatCurrency(d.amount)}
                        </div>
                        <span
                          className={`donation-status ${String(
                            d.status
                          ).toLowerCase()}`}
                        >
                          {d.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="material-symbols-outlined empty-icon">
                    inbox
                  </span>
                  <p>No donations yet</p>
                  <p className="empty-subtitle">
                    Start making a difference today!
                  </p>
                </div>
              )}
            </div>
          </div>

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
