import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import './LoginPage.css';

const formatAuthError = (error) => {
    if (!error) return 'An error occurred during authentication.';
    const code = error.code || error.message;
    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Invalid email or password. Please check your credentials.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return 'Sign-in popup was closed before completing.';
        case 'auth/popup-blocked':
            return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized for Google Sign-In in Firebase Console.';
        case 'auth/operation-not-allowed':
            return 'Google Sign-In is not enabled in Firebase Console.';
        default:
            return error.message || 'An error occurred during authentication.';
    }
};

const LoginPage = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        if (isSignUp && (!name.trim() || !age || !gender)) {
            setError('Please fill in Name, Age, and Gender');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
                const userRef = doc(db, "users", userCredential.user.uid);
                await setDoc(userRef, {
                    name: name.trim(),
                    age,
                    gender,
                    email: normalizedEmail,
                    profileCompleted: true,
                    hasPaid: false,
                    trialStartDate: new Date().toISOString()
                });
                await updateProfile(userCredential.user, { displayName: name.trim() });
            } else {
                await signInWithEmailAndPassword(auth, normalizedEmail, password);
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(formatAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setError('');
            setLoading(true);
            const credential = GoogleAuthProvider.credential(credentialResponse.credential);
            await signInWithCredential(auth, credential);
        } catch (err) {
            console.error("Firebase Auth Error:", err);
            setError(formatAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In failed or was cancelled. Please try the Google Sign-In button again.');
    };

    const handleDirectGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                console.error("Google popup error:", err);
                setError(formatAuthError(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="auth-card">
                <div className="tab-container">
                    <button
                        className={`tab-btn ${!isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(false); setError(''); }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-btn ${isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(true); setError(''); }}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="auth-header">
                    <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                    <p>{isSignUp ? 'Enter your details to register' : 'Enter your details to continue'}</p>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--error-bg)',
                        color: 'var(--error-text)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        placeholder="25"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        required
                                        min="10"
                                        max="120"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', paddingRight: '2.75rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    padding: '0.2rem'
                                }}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="divider">
                    <span>Or continue with</span>
                </div>

                <div className="google-auth" style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        shape="rectangular"
                        size="large"
                        width="100%"
                        logo_alignment="center"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
