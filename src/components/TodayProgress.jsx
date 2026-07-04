import React from 'react';
import { formatDate } from '../utils/dateUtils';

const TodayProgress = ({ habits }) => {
    const today = formatDate(new Date());
    const totalHabits = habits.length;
    const completedHabits = habits.filter(h => h.completions && h.completions[today]).length;
    const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // SVG Circle properties
    const radius = 80; // Slightly larger
    const stroke = 12; // Thinner for more elegance
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="today-progress-card glass-card animate-in" style={{ padding: '1.5rem 2rem' }}>
            <h3 className="progress-title" style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-secondary)' }}>Today's Focus</h3>
            <div className="doughnut-container" style={{ marginTop: '1rem' }}>
                <svg
                    height={radius * 1.8}
                    width={radius * 1.8}
                    className="doughnut-svg"
                    style={{ filter: 'drop-shadow(0 10px 15px rgba(230, 161, 123, 0.15))' }}
                >
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E6A17B" />
                            <stop offset="100%" stopColor="#D88F6A" />
                        </linearGradient>
                    </defs>
                    {/* Background Circle */}
                    <circle
                        stroke="rgba(0,0,0,0.03)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius - 10}
                        cx={radius * 0.9}
                        cy={radius * 0.9}
                    />
                    {/* Progress Circle */}
                    <circle
                        stroke="url(#progressGradient)"
                        fill="transparent"
                        strokeWidth={stroke + 2}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{
                            strokeDashoffset: circumference - (percentage / 100) * circumference,
                            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        strokeLinecap="round"
                        r={normalizedRadius - 10}
                        cx={radius * 0.9}
                        cy={radius * 0.9}
                        transform={`rotate(-90 ${radius * 0.9} ${radius * 0.9})`}
                    />
                </svg>
                <div className="doughnut-text">
                    <span className="fraction" style={{ fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
                        {completedHabits}<span style={{ opacity: 0.3, fontSize: '1rem' }}>/</span>{totalHabits}
                    </span>
                    <span className="percentage" style={{ fontWeight: 800, fontSize: '0.9rem' }}>{percentage}%</span>
                </div>
            </div>
        </div>
    );
};

export default TodayProgress;
