import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            alert('Please enter email and password');
            setLoading(false);
            return;
        }

        if (isSignUp && (!name || !age || !gender)) {
            alert('Please fill in Name, Age, and Gender');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // Sign Up Logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("Account created:", userCredential.user);

                // Save Profile to Firestore
                try {
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                        name: name,
                        age: age,
                        gender: gender,
                        email: email,
                        profileCompleted: true,
                        hasPaid: false,
                        trialStartDate: new Date().toISOString()
                    });

                    // Update Auth Profile
                    await updateProfile(userCredential.user, { displayName: name });
                    console.log("Profile saved and updated.");

                } catch (dbError) {
                    console.error("Error saving profile:", dbError);
                    // Continue anyway, App.jsx handles missing data gracefully or user can edit later
                }

            } else {
                // Sign In Logic
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Logged in successfully");
            }
        } catch (error) {
            console.error("Auth error:", error);
            if (isSignUp) {
                if (error.code === 'auth/email-already-in-use') {
                    alert("This email is already registered. Please switch to Sign In.");
                } else {
                    alert(`Signup failed: ${error.message}`);
                }
            } else {
                // Login Error Handling
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    alert("Invalid email or password. If you are new, please switch to Sign Up.");
                } else if (error.code === 'auth/operation-not-allowed') {
                    alert("Email/Password Sign-In is disabled. Please enable it in the Firebase Console.");
                } else {
                    alert(`Login failed: ${error.message}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google Login Response:', credentialResponse);
        try {
            const credential = GoogleAuthProvider.credential(credentialResponse.credential);
            const result = await signInWithCredential(auth, credential);
            console.log("Firebase Sign-In Success:", result.user);
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
                <div className="auth-tabs">
                    <button
                        className={`tab-btn ${!isSignUp ? 'active' : ''}`}
                        onClick={() => setIsSignUp(false)}
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-btn ${isSignUp ? 'active' : ''}`}
                        onClick={() => setIsSignUp(true)}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="login-header">
                    <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p>{isSignUp ? 'Start your journey today' : 'Enter your details to continue'}</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    id="age"
                                    className="form-input"
                                    type="number"
                                    placeholder="e.g. 25"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                    min="10"
                                    max="120"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    className="form-input"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                    style={{ background: 'var(--card-background)', color: 'var(--text-primary)' }}
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                        </>
                    )}

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
                            autoComplete="username"
                            onInvalid={(e) => e.target.setCustomValidity("Please enter correct I'D")}
                            onInput={(e) => e.target.setCustomValidity('')}
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
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
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
