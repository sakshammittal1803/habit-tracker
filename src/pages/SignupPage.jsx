import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from "firebase/auth";
import './LoginPage.css'; // Reuse login styles

const SignupPage = ({ user, onComplete }) => {
    const [name, setName] = useState(() => auth.currentUser?.displayName || user?.name || '');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!auth.currentUser) {
                setError("No authenticated session found. Please sign in again.");
                return;
            }

            const trimmedName = name.trim();
            if (!trimmedName) {
                setError("Please enter your name.");
                setLoading(false);
                return;
            }

            const userRef = doc(db, "users", auth.currentUser.uid);

            await setDoc(userRef, {
                name: trimmedName,
                age: Number(age),
                gender,
                profileCompleted: true,
                email: (auth.currentUser.email || '').toLowerCase(),
            }, { merge: true });

            await updateProfile(auth.currentUser, { displayName: trimmedName });

            if (onComplete) {
                onComplete();
            }
            navigate('/');
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to save profile: " + (err.message || "Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Complete Profile</h2>
                    <p>Tell us about yourself to personalize your experience.</p>
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
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                id="age"
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
                            <label htmlFor="gender">Gender</label>
                            <select
                                id="gender"
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

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
