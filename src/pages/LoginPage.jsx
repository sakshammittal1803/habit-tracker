import React, { useState } from 'react'
import './LoginPage.css'

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (email && password) {
            setIsLoading(true)
            setTimeout(() => {
                onLogin()
                // No need to set false as component will unmount/navigate
            }, 5000)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-actions">
                        <label className="remember-me">
                            <input type="checkbox" disabled={isLoading} />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Signing In...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
