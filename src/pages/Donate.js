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
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load campaign from backend API
  useEffect(() => {
    async function loadCampaign() {
      try {
        setError("");
        setCampaign(null);

        const res = await fetch(`/api/campaigns/${campaignId}/`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.detail || "Campaign not found");
        }

        setCampaign(data);
      } catch (e) {
        setError(e.message || "Campaign not found");
      }
    }

    if (campaignId) {
      loadCampaign();
    } else {
      setError("Campaign not found");
    }
  }, [campaignId]);

  const quickAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString());
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      if (value) {
        setDonationAmount(value);
      }
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

    // Must be logged in (token saved by Login.js)
    const token = localStorage.getItem("auth:access");
    if (!token) {
      setError("Please log in first to donate");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/donations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: parseInt(campaignId, 10),
          amount: amount,
          paymentMethod: paymentMethod,
          isAnonymous: isAnonymous,
          status: "Completed",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || data?.message || "Donation failed";
        throw new Error(msg);
      }

      // Temporary compatibility: keep localStorage donation history until we connect DonationHistory to the API
      const donations = JSON.parse(localStorage.getItem("donations") || "[]");
      const newDonation = {
        id: data?.id || Date.now(),
        campaignTitle: data?.campaignTitle || campaign?.title,
        organization: data?.organization || campaign?.organization,
        amount: amount,
        date: new Date().toISOString(),
        paymentMethod: paymentMethod,
        isAnonymous: isAnonymous,
        status: "Completed",
      };
      donations.unshift(newDonation);
      localStorage.setItem("donations", JSON.stringify(donations));

      // Temporary compatibility: update total donations in userData (used by some UI pages)
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const currentTotal = userData.totalDonations || 0;
      userData.totalDonations = currentTotal + amount;
      localStorage.setItem("userData", JSON.stringify(userData));

      navigate("/donation-history");
    } catch (e) {
      setError(e.message || "Donation failed");
    } finally {
      setIsProcessing(false);
    }
  };

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
            <div className="error-message">
              {error || "Loading campaign..."}
            </div>
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
                      donationAmount === amount.toString() ? "active" : ""
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
