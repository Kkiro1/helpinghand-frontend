import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorHome.css";

const DonorHome = () => {
  const navigate = useNavigate();

  const [donorName, setDonorName] = useState("User"); // Default fallback
  const [userEmail, setUserEmail] = useState("");

  const [totalDonations, setTotalDonations] = useState(0);
  const [recentDonations, setRecentDonations] = useState([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load user info from localStorage (name/email for header)
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData) {
      if (userData.name) setDonorName(userData.name);
      else if (userData.email) setDonorName(userData.email.split("@")[0]);

      if (userData.email) setUserEmail(userData.email);
    }

    // Load real donations from API
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDonationDate = (d) => {
    // try common backend field names
    return (
      d.date || d.created_at || d.createdAt || d.timestamp || d.time || null
    );
  };

  const normalizeDonationsList = (data) => {
    // supports DRF pagination { results: [...] } OR plain array [...]
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  const mapDonationForUI = (d) => {
    // campaign display (backend may return nested campaign or just id)
    const campaignTitle =
      d.campaignTitle ||
      d.campaign_title ||
      d.campaign?.title ||
      d.campaign?.name ||
      (typeof d.campaign === "string" ? d.campaign : null) ||
      (typeof d.campaign === "number" ? `Campaign #${d.campaign}` : "Campaign");

    const amount = Number(d.amount || 0);

    const statusRaw = d.status || "Completed";
    const status =
      typeof statusRaw === "string" ? statusRaw : String(statusRaw);

    return {
      id: d.id ?? `${campaignTitle}-${getDonationDate(d) ?? Date.now()}`,
      organization: campaignTitle,
      amount,
      date: getDonationDate(d) || new Date().toISOString(),
      status,
    };
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("auth:refresh");
    if (!refresh) return null;

    // Most common with SimpleJWT:
    // POST /api/auth/token/refresh/ { refresh: "..." } => { access: "..." }
    const res = await fetch("/api/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) return null;

    const newAccess = data?.access;
    if (newAccess) {
      localStorage.setItem("auth:access", newAccess);
      return newAccess;
    }
    return null;
  };

  const fetchDonations = async (token) => {
    const res = await fetch("/api/donations/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);
    return { res, data };
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      let token = localStorage.getItem("auth:access");

      if (!token) {
        setError("Please log in first");
        navigate("/login");
        return;
      }

      // 1) Try normally
      let { res, data } = await fetchDonations(token);

      // 2) If unauthorized, try refresh then retry once
      if (!res.ok && (res.status === 401 || res.status === 403)) {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          token = newAccess;
          ({ res, data } = await fetchDonations(token));
        }
      }

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          (data
            ? Object.entries(data)
                .map(
                  ([k, v]) =>
                    `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
                )
                .join(" | ")
            : `HTTP ${res.status}`);
        throw new Error(msg);
      }

      const list = normalizeDonationsList(data);
      const uiList = list.map(mapDonationForUI);

      // Sort newest first
      uiList.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Recent (top 5)
      setRecentDonations(uiList.slice(0, 5));

      // Total donations
      const total = uiList.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      setTotalDonations(total);

      // Total campaigns (unique)
      const uniqueCampaigns = new Set(
        list.map(
          (d) =>
            d.campaign?.id ??
            d.campaignId ??
            d.campaign ??
            d.campaign_title ??
            d.campaignTitle
        )
      );
      // Remove undefined/null noise
      const cleaned = new Set(
        [...uniqueCampaigns].filter((x) => x !== undefined && x !== null)
      );
      setTotalCampaigns(cleaned.size || (uiList.length ? uiList.length : 0));

      // This month total
      const now = new Date();
      const monthTotal = uiList
        .filter((d) => {
          const dt = new Date(d.date);
          return (
            dt.getMonth() === now.getMonth() &&
            dt.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      setThisMonthTotal(monthTotal);
    } catch (e) {
      setError(e.message || "Couldn't load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleNewDonation = () => {
    navigate("/campaigns");
  };

  const handleLogout = () => {
    // Clear auth + user info
    localStorage.removeItem("auth:access");
    localStorage.removeItem("auth:refresh");
    localStorage.removeItem("userData");
    // optional old demo data:
    localStorage.removeItem("donations");
    navigate("/login");
  };

  return (
    <div className="donor-home">
      {/* Header */}
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

      {/* Main Content */}
      <main className="donor-main">
        <div className="donor-content">
          {/* Page Title */}
          <div className="page-header">
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">
              Track your donations and make a difference
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-message" style={{ marginBottom: 16 }}>
              <span className="material-symbols-outlined">error</span>
              {error}
              <button
                onClick={loadDashboard}
                style={{ marginLeft: 12, cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards Grid */}
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

          {/* Recent Donations Section */}
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
                    hourglass_empty
                  </span>
                  <p>Loading donations...</p>
                </div>
              ) : recentDonations.length > 0 ? (
                recentDonations.map((donation) => (
                  <div key={donation.id} className="donation-card">
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
                            {donation.organization}
                          </h4>
                          <p className="donation-date">
                            <span className="material-symbols-outlined date-icon">
                              calendar_today
                            </span>
                            {formatDate(donation.date)}
                          </p>
                        </div>
                      </div>
                      <div className="donation-amount-wrapper">
                        <div className="donation-amount">
                          {formatCurrency(donation.amount)}
                        </div>
                        <span
                          className={`donation-status ${String(
                            donation.status
                          ).toLowerCase()}`}
                        >
                          {donation.status}
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
