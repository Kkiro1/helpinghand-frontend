import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authFetch from "../utils/authFetch";
import "./Campaigns.css";

const Campaigns = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoading(true);
        setError("");

        const res = await authFetch("/api/campaigns/");
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg = data?.detail || data?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        // Support both: array or paginated {results: []}
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        setCampaigns(list);
      } catch (e) {
        if (e?.status === 401) {
          navigate("/login");
          return;
        }
        setError(e.message || "Error loading campaigns");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [navigate]);

  const categories = [
    "all",
    "Education",
    "Food",
    "Health",
    "Shelter",
    "Animals",
    "Environment",
  ];

  const handleCampaignClick = (campaignId) => {
    navigate(`/donate/${campaignId}`);
  };

  const handleBack = () => {
    navigate("/donor-home");
  };

  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const title = (campaign.title || "").toLowerCase();
      const desc = (campaign.description || "").toLowerCase();
      const category = campaign.category || "";

      const matchesSearch = title.includes(term) || desc.includes(term);
      const matchesCategory =
        selectedCategory === "all" || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [campaigns, searchTerm, selectedCategory]);

  const formatCurrency = (amount) => {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  };

  const calculateProgress = (raised, goal) => {
    const r = Number(raised) || 0;
    const g = Number(goal) || 0;
    if (g <= 0) return 0;
    return Math.min((r / g) * 100, 100);
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return "No deadline";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading campaigns...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        {error}
        <div style={{ marginTop: 10 }}>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

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
              <span className="material-symbols-outlined search-icon">
                search
              </span>
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
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="campaigns-grid">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => {
                const progress = calculateProgress(
                  campaign.raised,
                  campaign.goal
                );

                return (
                  <div
                    key={campaign.id}
                    className="campaign-card"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    <div className="campaign-image">
                      <span className="campaign-emoji">
                        {campaign.image || "🎯"}
                      </span>
                    </div>

                    <div className="campaign-content">
                      <div className="campaign-header">
                        <span className="campaign-category">
                          {campaign.category || "General"}
                        </span>
                        <span className="campaign-deadline">
                          <span className="material-symbols-outlined">
                            schedule
                          </span>
                          {formatDeadline(campaign.deadline)}
                        </span>
                      </div>

                      <h3 className="campaign-title">{campaign.title}</h3>
                      <p className="campaign-org">{campaign.organization}</p>
                      <p className="campaign-description">
                        {campaign.description}
                      </p>

                      <div className="campaign-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="progress-stats">
                          <span className="progress-raised">
                            {formatCurrency(campaign.raised)}
                          </span>
                          <span className="progress-goal">
                            of {formatCurrency(campaign.goal)}
                          </span>
                        </div>
                      </div>

                      <div className="campaign-footer">
                        <div className="campaign-donors">
                          <span className="material-symbols-outlined">
                            people
                          </span>
                          <span>{campaign.donors || 0} donors</span>
                        </div>
                        <button
                          className="donate-btn-card"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCampaignClick(campaign.id);
                          }}
                        >
                          Donate Now
                          <span className="material-symbols-outlined">
                            arrow_forward
                          </span>
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
                <p className="no-campaigns-subtitle">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;
