import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorHome.css";

const DonorHome = () => {
  const navigate = useNavigate();

  const [donorName, setDonorName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  const [totalDonations, setTotalDonations] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [recentDonations, setRecentDonations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- helpers ----------
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("auth:access");
    localStorage.removeItem("auth:refresh");
    localStorage.removeItem("auth:user");
    localStorage.removeItem("userData");
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("auth:refresh");
    if (!refresh) return null;

    const candidates = [
      { url: "/api/auth/refresh/", body: { refresh } },
      { url: "/api/auth/refresh/", body: { refresh_token: refresh } },
      { url: "/api/token/refresh/", body: { refresh } },
    ];

    for (const c of candidates) {
      try {
        const res = await fetch(c.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c.body),
        });

        const data = await safeJson(res);
        if (res.ok && data?.access) {
          localStorage.setItem("auth:access", data.access);
          if (data.refresh) localStorage.setItem("auth:refresh", data.refresh);
          return data.access;
        }
      } catch {
        // try next
      }
    }

    return null;
  };

  const authFetch = async (url, options = {}) => {
    const access = localStorage.getItem("auth:access");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${access}`,
    };

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        const headers2 = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        };
        res = await fetch(url, { ...options, headers: headers2 });
      }
    }

    return res;
  };

  const num = (x) => {
    const n = typeof x === "number" ? x : parseFloat(x);
    return Number.isFinite(n) ? n : 0;
  };

  const getDate = (d) => {
    // support multiple possible backend field names
    return (
      d?.date ||
      d?.created_at ||
      d?.createdAt ||
      d?.timestamp ||
      d?.created ||
      null
    );
  };

  const getCampaignId = (d) => {
    // support: campaign (id) OR campaign.id OR campaignId
    if (Number.isFinite(d?.campaign)) return d.campaign;
    if (Number.isFinite(d?.campaignId)) return d.campaignId;
    if (Number.isFinite(d?.campaign?.id)) return d.campaign.id;
    return null;
  };

  const getCampaignTitle = (d) => {
    return (
      d?.campaignTitle ||
      d?.campaign_title ||
      d?.campaign?.title ||
      d?.campaign_name ||
      "Campaign"
    );
  };

  const getOrganization = (d) => {
    return d?.organization || d?.campaign?.organization || "Organization";
  };

  const getStatus = (d) => {
    return d?.status || d?.status_display || "Completed";
  };

  const mapDonationForCards = (d) => {
    return {
      id: d?.id ?? `${getCampaignId(d) ?? "c"}-${getDate(d) ?? Math.random()}`,
      organization: getCampaignTitle(d) || getOrganization(d),
      amount: num(d?.amount),
      date: getDate(d) || new Date().toISOString(),
      status: getStatus(d),
    };
  };

  // ---------- load dashboard ----------
  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    // user data (name/email) can still come from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    if (userData) {
      if (userData.name) setDonorName(userData.name);
      else if (userData.email) setDonorName(userData.email.split("@")[0]);
      if (userData.email) setUserEmail(userData.email);
    }

    const token = localStorage.getItem("auth:access");
    if (!token) {
      setLoading(false);
      setError("Please log in first");
      navigate("/login");
      return;
    }

    try {
      const res = await authFetch("/api/donations/");
      const data = await safeJson(res);

      if (!res.ok) {
        if (res.status === 401) {
          clearAuth();
          navigate("/login");
          return;
        }
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }

      // Support array or paginated {results: []}
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      // Sort by date desc (safe)
      const sorted = [...list].sort((a, b) => {
        const da = new Date(getDate(a) || 0).getTime();
        const db = new Date(getDate(b) || 0).getTime();
        return db - da;
      });

      // totals (count only completed for money)
      const completed = sorted.filter(
        (d) => String(getStatus(d)).toLowerCase() === "completed"
      );

      const total = completed.reduce((sum, d) => sum + num(d.amount), 0);

      const now = new Date();
      const monthTotal = completed
        .filter((d) => {
          const dt = new Date(getDate(d));
          return (
            dt.getMonth() === now.getMonth() &&
            dt.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, d) => sum + num(d.amount), 0);

      const campaignSet = new Set();
      sorted.forEach((d) => {
        const cid = getCampaignId(d);
        if (cid !== null) campaignSet.add(cid);
        else campaignSet.add(getCampaignTitle(d)); // fallback if no id
      });

      setTotalDonations(total);
      setThisMonthTotal(monthTotal);
      setTotalCampaigns(campaignSet.size);

      setRecentDonations(sorted.slice(0, 5).map(mapDonationForCards));
    } catch (e) {
      setError(e.message || "Couldn't load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleNewDonation = () => navigate("/campaigns");

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  if (loading) {
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
          </div>
        </header>

        <main className="donor-main">
          <div className="donor-content">
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">sync</span>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            {error && (
              <div className="error-message" style={{ marginTop: 12 }}>
                <span className="material-symbols-outlined">error</span>
                {error}
                <button
                  onClick={loadDashboard}
                  style={{
                    marginLeft: 12,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

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
              {recentDonations.length > 0 ? (
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
