import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Donate.css";

const Donate = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [donationAmount, setDonationAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [campaign, setCampaign] = useState(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
    // NOTE: we do NOT remove userData here (DonorHome uses it for name/email).
  };

  // (optional but good) auto-refresh if access expired, then retry once
  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("auth:refresh");
    if (!refresh) return null;

    // Try common refresh endpoints (one of these should match your backend)
    const candidates = [
      { url: "/api/auth/refresh/", body: { refresh } }, // SimpleJWT style
      { url: "/api/auth/refresh/", body: { refresh_token: refresh } }, // custom style
      { url: "/api/token/refresh/", body: { refresh } }, // another common style
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
        // ignore and try next candidate
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

    // If unauthorized, try refresh once then retry
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

  // ---------- Load campaign from backend API ----------
  useEffect(() => {
    async function loadCampaign() {
      try {
        setError("");
        setLoadingCampaign(true);

        const res = await fetch(`/api/campaigns/${campaignId}/`);
        const data = await safeJson(res);

        if (!res.ok) {
          throw new Error(data?.detail || "Campaign not found");
        }

        setCampaign(data);
      } catch (e) {
        setCampaign(null);
        setError(e.message || "Campaign not found");
      } finally {
        setLoadingCampaign(false);
      }
    }

    if (campaignId) loadCampaign();
    else {
      setLoadingCampaign(false);
      setError("Campaign not found");
    }
  }, [campaignId]);

  const quickAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (amount) => {
    setDonationAmount(String(amount));
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setDonationAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amount = parseFloat(donationAmount);
    if (!amount || amount < 1) {
      setError("Please enter a valid donation amount");
      return;
    }

    const token = localStorage.getItem("auth:access");
    if (!token) {
      setError("Please log in first to donate");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const campaignPk = parseInt(campaignId, 10);

      // backend expects "campaign" (FK)
      const payload = {
        campaign: campaignPk,
        amount: amount,
        paymentMethod: paymentMethod,
        isAnonymous: isAnonymous,
        status: "Completed",
      };

      const res = await authFetch("/api/donations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        // if still 401 after refresh attempt -> force login
        if (res.status === 401) {
          clearAuth();
          setError("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        // show DRF-style field errors nicely
        let msg = `HTTP ${res.status}`;
        if (data) {
          if (typeof data === "string") msg = data;
          else if (data.detail) msg = data.detail;
          else if (data.message) msg = data.message;
          else {
            msg = Object.entries(data)
              .map(
                ([k, v]) =>
                  `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
              )
              .join(" | ");
          }
        }
        throw new Error(msg);
      }

      // ✅ IMPORTANT: No more localStorage donation saving.
      // DonationHistory / DonorHome already read from /api/donations/
      navigate("/donation-history");
    } catch (e) {
      setError(e.message || "Donation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- Loading / error state ----------
  if (loadingCampaign) {
    return (
      <div className="donate-page">
        <header className="donate-header">
          <div className="header-container">
            <button className="back-btn" onClick={() => navigate("/campaigns")}>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back to Campaigns</span>
            </button>
          </div>
        </header>
        <main className="donate-main">
          <div className="donate-content">
            <div className="error-message">Loading campaign...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="donate-page">
        <header className="donate-header">
          <div className="header-container">
            <button className="back-btn" onClick={() => navigate("/campaigns")}>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back to Campaigns</span>
            </button>
          </div>
        </header>
        <main className="donate-main">
          <div className="donate-content">
            <div className="error-message">{error || "Campaign not found"}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <header className="donate-header">
        <div className="header-container">
          <button className="back-btn" onClick={() => navigate("/campaigns")}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Campaigns</span>
          </button>
        </div>
      </header>

      <main className="donate-main">
        <div className="donate-content">
          {/* Campaign Info */}
          <div className="campaign-info-card">
            <div className="campaign-image-large">
              <span className="campaign-emoji-large">{campaign.image}</span>
            </div>
            <div className="campaign-details">
              <h1 className="campaign-title">{campaign.title}</h1>
              <p className="campaign-organization">{campaign.organization}</p>
            </div>
          </div>

          {/* Donation Form */}
          <form className="donation-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Amount Selection */}
            <div className="form-section">
              <label className="form-label">Select Donation Amount</label>
              <div className="amount-buttons">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`amount-btn ${
                      donationAmount === String(amount) ? "active" : ""
                    }`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="custom-amount-section">
                <label className="custom-amount-label">
                  Or enter custom amount
                </label>
                <div className="custom-amount-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="custom-amount-input"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <label className="form-label">Payment Method</label>
              <div className="payment-methods">
                <label
                  className={`payment-method ${
                    paymentMethod === "card" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="material-symbols-outlined">credit_card</span>
                  <span>Credit/Debit Card</span>
                </label>

                <label
                  className={`payment-method ${
                    paymentMethod === "paypal" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="material-symbols-outlined">
                    account_balance_wallet
                  </span>
                  <span>PayPal</span>
                </label>
              </div>
            </div>

            {/* Anonymous Donation */}
            <div className="form-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="checkbox-input"
                />
                <span>Make this donation anonymous</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-donation-btn"
              disabled={!donationAmount || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined spinning">
                    sync
                  </span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    volunteer_activism
                  </span>
                  Complete Donation
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Donate;
