import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = ({ onPaymentSuccess, user, trialDaysLeft, hasPaid }) => {
    const navigate = useNavigate();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const res = await loadRazorpayScript();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const options = {
            key: 'rzp_live_SEjqtAAqpngmJn', // Enter the Key ID generated from the Dashboard
            amount: '10000', // Amount is in currency subunits. Default currency is INR. Hence, 10000 refers to 10000 paise (100 INR)
            currency: 'INR',
            name: 'Habit Tracker Pro',
            description: 'Pro Subscription',
            image: 'https://example.com/your_logo',
            handler: function (response) {
                onPaymentSuccess();
                navigate('/');
            },
            prefill: {
                name: user?.name || 'User',
                email: user?.email || 'user@example.com',
                contact: '', // Phone number is not collected
            },
            notes: {
                address: 'Razorpay Corporate Office',
            },
            theme: {
                color: '#3182ce',
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    const isTrialActive = trialDaysLeft > 0;

    if (hasPaid) {
        return (
            <div className="payment-page">
                <div className="payment-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h1 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Thanks for purchasing!</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        You have lifetime access to all Premium features. Enjoy tracking your habits without limits!
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-header">
                <h1>Choose Your Plan</h1>
                <p>Start with a free trial or upgrade for lifetime access.</p>
            </div>

            <div className="pricing-container">
                {/* Free Trial Card */}
                <div className="payment-card">
                    <h2 className="card-title">Free Trial</h2>
                    <p className="card-subtitle">Experience all features</p>

                    <div className="price-tag">
                        <span className="currency">₹</span>
                        <span className="amount">0</span>
                        <span className="period">/ 30 days</span>
                    </div>

                    <div className={`trial-status ${!isTrialActive ? 'trial-expired' : ''}`}>
                        {isTrialActive ? `${trialDaysLeft} Days Remaining` : 'Trial Expired'}
                    </div>

                    <ul className="features-list">
                        <li><span className="check-icon">✓</span> Unlimited Habits</li>
                        <li><span className="check-icon">✓</span> Weekly Stats</li>
                        <li><span className="check-icon">✓</span> Data Tracking</li>
                        <li className="feature-unavailable"><span className="cross-icon">✕</span> Lifetime Access</li>
                    </ul>

                    <button className="current-plan-btn" disabled>
                        {isTrialActive ? 'Active Plan' : 'Expired'}
                    </button>
                </div>

                {/* Pro Card */}
                <div className="payment-card" style={{ border: '2px solid var(--primary-color)', transform: 'scale(1.02)' }}>
                    <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.2rem 1rem', borderRadius: '20px', fontSize: '0.8rem', position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontWeight: '600' }}>
                        MOST POPULAR
                    </div>
                    <h2 className="card-title">Lifetime Pro</h2>
                    <p className="card-subtitle">Unlock everything forever</p>

                    <div className="price-tag">
                        <span className="currency">₹</span>
                        <span className="amount">100</span>
                        <span className="period">/ one-time</span>
                    </div>

                    <ul className="features-list">
                        <li><span className="check-icon">✓</span> Unlimited Habits</li>
                        <li><span className="check-icon">✓</span> Detailed Analytics</li>
                        <li><span className="check-icon">✓</span> Priority Support</li>
                        <li><span className="check-icon">✓</span> Lifetime Access</li>
                    </ul>

                    <button className="checkout-btn" onClick={handlePayment}>
                        Get Pro Access
                    </button>

                    <div className="secure-badge">
                        <span className="lock-icon">🔒</span>
                        Secured by Razorpay
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
