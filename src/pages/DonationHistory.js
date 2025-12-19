import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DonationHistory.css";

const DonationHistory = () => {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- helpers ----------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeDonation = (d) => {
    const campaignId =
      typeof d.campaign === "number"
        ? d.campaign
        : typeof d.campaignId === "number"
        ? d.campaignId
        : d.campaign?.id;

    return {
      id: d.id ?? `${campaignId ?? "x"}-${d.created_at ?? Date.now()}`,
      campaignTitle:
        d.campaignTitle ||
        d.campaign_title ||
        d.campaign?.title ||
        (campaignId ? `Campaign #${campaignId}` : "Campaign"),
      organization:
        d.organization ||
        d.campaign?.organization ||
        d.campaign?.owner ||
        d.owner ||
        "",
      amount: Number(d.amount ?? 0),
      date: d.date || d.created_at || d.createdAt || new Date().toISOString(),
      paymentMethod: d.paymentMethod || d.payment_method || "card",
      isAnonymous: d.isAnonymous ?? d.is_anonymous ?? false,
      status: d.status || "Completed",
    };
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("auth:refresh");
    if (!refresh) return null;

    // ✅ Change this if your backend uses a different refresh endpoint
    const refreshUrl = "/api/auth/refresh/";

    const res = await fetch(refreshUrl, {
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

  const fetchWithAuth = async (url, options = {}) => {
    const access = localStorage.getItem("auth:access");

    if (!access) {
      throw new Error("You are not logged in. Please login again.");
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${access}`,
      },
    });

    // If token expired -> try refresh once
    if (res.status === 401) {
      const newAccess = await refreshAccessToken();
      if (!newAccess) {
        throw new Error("Session expired. Please login again.");
      }

      // retry once with new token
      return fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        },
      });
    }

    return res;
  };

  const loadDonations = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithAuth("/api/donations/");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          `Failed to load donations (HTTP ${res.status})`;
        throw new Error(msg);
      }

      const list = Array.isArray(data) ? data : [];
      setDonations(list.map(normalizeDonation));
    } catch (e) {
      setDonations([]);
      setError(e.message || "Could not load donations");
    } finally {
      setLoading(false);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    loadDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- derived values ----------
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (filter === "all") return true;
      return String(d.status || "").toLowerCase() === filter.toLowerCase();
    });
  }, [donations, filter]);

  const totalDonated = useMemo(() => {
    return donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [donations]);

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return donations
      .filter((d) => {
        const dt = new Date(d.date);
        return (
          !Number.isNaN(dt.getTime()) &&
          dt.getMonth() === now.getMonth() &&
          dt.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [donations]);

  // ---------- handlers ----------
  const handleBack = () => navigate("/donor-home");
  const handleNewDonation = () => navigate("/campaigns");

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="donation-history-page">
        <main className="history-main">
          <div className="history-content">
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">
                hourglass_top
              </span>
              <h3>Loading donations...</h3>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donation-history-page">
        <main className="history-main">
          <div className="history-content">
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">
                error
              </span>
              <h3>Couldn't load donations</h3>
              <p className="empty-subtitle">{error}</p>
              <button className="empty-action-btn" onClick={loadDonations}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        </div>
      </main>
    </div>
  );
};

export default DonationHistory;
