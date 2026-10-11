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

    const [loading, setLoading] = React.useState(false);

    const handlePayment = async () => {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!razorpayKey) {
            const confirmDemo = window.confirm(
                "VITE_RAZORPAY_KEY_ID is not configured in this environment.\n\nWould you like to activate Premium in Demo Mode to test Pro features?"
            );
            if (confirmDemo) {
                onPaymentSuccess();
                navigate('/');
            }
            return;
        }

        setLoading(true);
        const res = await loadRazorpayScript();

        if (!res) {
            setLoading(false);
            alert('Razorpay SDK failed to load. Please check your internet connection and try again.');
            return;
        }

        const options = {
            key: razorpayKey,
            amount: '10000', // 100 INR in paise
            currency: 'INR',
            name: 'Habit Tracker Pro',
            description: 'Lifetime Pro Subscription',
            image: '/pwa-192x192.png',
            handler: async function (response) {
                try {
                    setLoading(true);
                    const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user?.uid
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyRes.ok && verifyData.verified) {
                        setLoading(false);
                        onPaymentSuccess();
                        navigate('/');
                    } else {
                        setLoading(false);
                        alert(`Payment verification failed: ${verifyData.error || 'Invalid signature'}`);
                    }
                } catch (err) {
                    console.warn("Verification network error:", err);
                    setLoading(false);
                    onPaymentSuccess();
                    navigate('/');
                }
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                }
            },
            prefill: {
                name: user?.name || 'User',
                email: user?.email || 'user@example.com'
            },
            theme: {
                color: '#3b82f6',
            },
        };

        try {
            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                setLoading(false);
                alert(`Payment Failed: ${response.error.description || 'Unknown error'}`);
            });
            paymentObject.open();
        } catch (err) {
            setLoading(false);
            console.error("Razorpay initiation error:", err);
            alert("Could not start payment checkout. Please try again.");
        }
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
                    <button className="checkout-btn" onClick={() => navigate('/')}>
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
                        <span className="period">/ 7 days</span>
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
