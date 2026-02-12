import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple mock login
        if (email && password) {
            // Mock user data for manual login
            const mockUser = {
                name: 'Test User',
                email: email,
                picture: null // No picture for manual login
            };
            // For manual login, valid Firebase auth is also needed for the app to work correctly
            // But for now, we are focusing on fixing Google Login
            alert('Please use Google Sign In');
        } else {
            alert('Please enter email and password');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google Login Response:', credentialResponse);
        try {
            const credential = GoogleAuthProvider.credential(credentialResponse.credential);
            const result = await signInWithCredential(auth, credential);
            console.log("Firebase Sign-In Success:", result.user);

            // App.jsx listens to onAuthStateChanged and will handle the redirect
            // But we can navigate to be sure, though onAuthStateChanged should trigger it.
            // navigate('/'); 
        } catch (error) {
            console.error("Firebase Auth Error:", error);
            alert(`Login failed: ${error.message}`);
        }
    };

    const handleGoogleError = () => {
        console.log('Google Login Failed');
        alert('Google Login Failed. Please try again.');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Login or Sign Up</h1>
                    <p>Enter your details to protect your progress</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            className="form-input"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="form-input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Sign In
                    </button>
                </form>

                <div className="divider">Or continue with</div>

                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
