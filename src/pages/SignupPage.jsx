import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from "firebase/auth";
import './LoginPage.css'; // Reuse login styles

const SignupPage = ({ user, onComplete }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!auth.currentUser) {
                alert("No user logged in!");
                return;
            }

            const userRef = doc(db, "users", auth.currentUser.uid);

            // Update user profile in Firestore
            await setDoc(userRef, {
                name: name,
                age: age,
                gender: gender,
                profileCompleted: true,
                email: auth.currentUser.email,
                // Preserve existing fields if any (like trialStartDate)
            }, { merge: true }); // Merge checks for existing fields

            // Also update auth profile display name
            await updateProfile(auth.currentUser, { displayName: name });

            if (onComplete) {
                onComplete();
            }
            navigate('/');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Complete Your Profile</h1>
                    <p>Tell us a bit about yourself to personalize your experience.</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
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

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Saving...' : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
