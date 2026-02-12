import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = ({ onPaymentSuccess, user }) => {
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

    return (
        <div className="payment-page">
            <div className="payment-card">
                <div className="payment-header">
                    <h1>Upgrade to Pro</h1>
                    <p>Unlock the full potential of your habits</p>
                </div>

                <div className="price-tag">
                    <span className="currency">₹</span>
                    <span className="amount">100</span>
                    <span className="period">/ lifetime</span>
                </div>

                <ul className="features-list">
                    <li><span className="check-icon">✓</span> Unlimited Habits</li>
                    <li><span className="check-icon">✓</span> Detailed Analytics & Graphs</li>
                    <li><span className="check-icon">✓</span> Weekly Progress Reports</li>
                    <li><span className="check-icon">✓</span> Priority Support</li>
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
    );
};

export default PaymentPage;
