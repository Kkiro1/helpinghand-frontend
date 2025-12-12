import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Donate.css';

const Donate = () => {
    const navigate = useNavigate();
    const { campaignId } = useParams();
    const [donationAmount, setDonationAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Campaign data (in a real app, this would come from an API)
    const campaignsData = {
        1: {
            id: 1,
            title: 'Children\'s Education Fund',
            organization: 'Education for All Foundation',
            image: '📚'
        },
        2: {
            id: 2,
            title: 'Food Bank Network',
            organization: 'Community Food Bank',
            image: '🍽️'
        },
        3: {
            id: 3,
            title: 'Medical Relief Foundation',
            organization: 'Global Health Initiative',
            image: '🏥'
        },
        4: {
            id: 4,
            title: 'Homeless Shelter Support',
            organization: 'Hope Shelter Network',
            image: '🏠'
        },
        5: {
            id: 5,
            title: 'Animal Rescue Center',
            organization: 'Paws & Claws Rescue',
            image: '🐾'
        },
        6: {
            id: 6,
            title: 'Clean Water Initiative',
            organization: 'Water for Life',
            image: '💧'
        }
    };

    useEffect(() => {
        if (campaignId && campaignsData[campaignId]) {
            setCampaign(campaignsData[campaignId]);
        } else {
            setError('Campaign not found');
        }
    }, [campaignId]);

    const quickAmounts = [25, 50, 100, 250, 500];

    const handleAmountSelect = (amount) => {
        setDonationAmount(amount.toString());
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setCustomAmount(value);
            if (value) {
                setDonationAmount(value);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const amount = parseInt(donationAmount);
        if (!amount || amount < 1) {
            setError('Please enter a valid donation amount');
            return;
        }

        setIsProcessing(true);

        // Simulate processing
        setTimeout(() => {
            // Save donation to localStorage (in a real app, this would be an API call)
            const donations = JSON.parse(localStorage.getItem('donations') || '[]');
            const newDonation = {
                id: Date.now(),
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                organization: campaign.organization,
                amount: amount,
                date: new Date().toISOString(),
                paymentMethod: paymentMethod,
                isAnonymous: isAnonymous,
                status: 'Completed'
            };
            donations.unshift(newDonation);
            localStorage.setItem('donations', JSON.stringify(donations));

            // Update total donations
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const currentTotal = userData.totalDonations || 0;
            userData.totalDonations = currentTotal + amount;
            localStorage.setItem('userData', JSON.stringify(userData));

            setIsProcessing(false);
            navigate('/donation-history');
        }, 1500);
    };

    if (!campaign) {
        return (
            <div className="donate-page">
                <header className="donate-header">
                    <div className="header-container">
                        <button className="back-btn" onClick={() => navigate('/campaigns')}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span>Back to Campaigns</span>
                        </button>
                    </div>
                </header>
                <main className="donate-main">
                    <div className="donate-content">
                        <div className="error-message">{error || 'Loading campaign...'}</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="donate-page">
            <header className="donate-header">
                <div className="header-container">
                    <button className="back-btn" onClick={() => navigate('/campaigns')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Back to Campaigns</span>
                    </button>
                </div>
            </header>

            <main className="donate-main">
                <div className="donate-content">
                    <div className="donate-header-section">
                        <div className="campaign-preview">
                            <span className="campaign-emoji">{campaign.image}</span>
                            <div>
                                <h1 className="donate-title">{campaign.title}</h1>
                                <p className="campaign-org-name">{campaign.organization}</p>
                            </div>
                        </div>
                    </div>

                    <form className="donate-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                <span className="material-symbols-outlined">error</span>
                                {error}
                            </div>
                        )}

                        {/* Donation Amount */}
                        <div className="form-section">
                            <label className="form-label">Select Donation Amount</label>
                            <div className="quick-amounts">
                                {quickAmounts.map(amount => (
                                    <button
                                        key={amount}
                                        type="button"
                                        className={`amount-btn ${donationAmount === amount.toString() ? 'active' : ''}`}
                                        onClick={() => handleAmountSelect(amount)}
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>
                            <div className="custom-amount">
                                <label className="custom-amount-label">Or enter custom amount</label>
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
                                <label className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined">credit_card</span>
                                    <span>Credit/Debit Card</span>
                                </label>
                                <label className={`payment-method ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
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
                                />
                                <span>Make this donation anonymously</span>
                            </label>
                        </div>

                        {/* Donation Summary */}
                        {donationAmount && (
                            <div className="donation-summary">
                                <div className="summary-row">
                                    <span>Donation Amount</span>
                                    <span className="summary-amount">${parseInt(donationAmount).toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Processing Fee</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span className="summary-amount">${parseInt(donationAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="submit-donation-btn"
                            disabled={!donationAmount || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="material-symbols-outlined spinning">sync</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">volunteer_activism</span>
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
