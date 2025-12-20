import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authFetch from "../utils/authFetch";
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

  const quickAmounts = [25, 50, 100, 250, 500];

  const extractError = async (res) => {
    const data = await res.json().catch(() => null);
    if (!data) return `HTTP ${res.status}`;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    // DRF validation errors: { field: ["msg"] }
    if (typeof data === "object") {
      return Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
        .join(" | ");
    }

    return `HTTP ${res.status}`;
  };

  // Load campaign
  useEffect(() => {
    async function loadCampaign() {
      try {
        setError("");
        setLoadingCampaign(true);

        // campaigns might be public, but authFetch is safe (adds token if exists)
        const res = await authFetch(`/api/campaigns/${campaignId}/`);
        const data = await res.json().catch(() => null);

        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);

        setCampaign(data);
      } catch (e) {
        if (e?.status === 401) {
          navigate("/login");
          return;
        }
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
  }, [campaignId, navigate]);

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

      // ✅ backend expects FK field name: "campaign"
      const payload = {
        campaign: campaignPk,
        amount,
        paymentMethod,
        isAnonymous,
        status: "Completed",
      };

      const res = await authFetch("/api/donations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await extractError(res));

      // ✅ DonationHistory + DonorHome load from /api/donations/
      navigate("/donation-history");
    } catch (e2) {
      if (e2?.status === 401) {
        navigate("/login");
        return;
      }
      setError(e2.message || "Donation failed");
    } finally {
      setIsProcessing(false);
    }
  };

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
                {quickAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`amount-btn ${
                      donationAmount === String(a) ? "active" : ""
                    }`}
                    onClick={() => handleAmountSelect(a)}
                  >
                    ${a}
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
