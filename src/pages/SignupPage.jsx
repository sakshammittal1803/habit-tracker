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

            await setDoc(userRef, {
                name: name,
                age: age,
                gender: gender,
                profileCompleted: true,
                email: auth.currentUser.email,
            }, { merge: true });

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
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Complete Profile</h2>
                    <p>Tell us about yourself to personalize your experience.</p>
                </div>

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
