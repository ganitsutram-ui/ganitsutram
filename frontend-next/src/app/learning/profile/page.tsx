/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';

// Badge Definitions
const BADGE_VISUALS: Record<string, { icon: string, title: string, desc: string }> = {
    "first-solve": { icon: "⚡", title: "First Solve", desc: "Completed your first computation." },
    "ten-solves": { icon: "🔟", title: "Ten Solves", desc: "Solved 10 mathematical operations." },
    "century": { icon: "💯", title: "Century", desc: "Solved 100 operations. Remarkable." },
    "streak-3": { icon: "🔥", title: "On Fire", desc: "3-day solving streak." },
    "streak-7": { icon: "🌟", title: "Week Warrior", desc: "7-day solving streak." },
    "practice-10": { icon: "🎯", title: "Sharp Mind", desc: "Completed 10 practice problems." },
    "accuracy-80": { icon: "🏆", title: "High Accuracy", desc: "80% or higher practice accuracy." },
    "vedic-master": { icon: "🕉️", title: "Vedic Master", desc: "Used all 5 core Vedic operations." }
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { t, formatNumber, formatDate } = useI18n();

    const [stats, setStats] = useState<any>(null);
    const [practiceStats, setPracticeStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [concepts, setConcepts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE = '/api';

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const token = localStorage.getItem('gs_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [sRes, pRes, hRes, bRes, ssRes, cRes] = await Promise.all([
                    fetch(`${API_BASE}/user-progress/stats`, { headers }),
                    fetch(`${API_BASE}/practice/stats`, { headers }),
                    fetch(`${API_BASE}/user-progress?limit=10&offset=0`, { headers }),
                    fetch(`${API_BASE}/user-progress/badges`, { headers }),
                    fetch(`${API_BASE}/auth/sessions`, { headers }),
                    fetch(`${API_BASE}/concepts`, { headers })
                ]);

                if (sRes.ok) setStats((await sRes.json()).stats);
                if (pRes.ok) setPracticeStats((await pRes.json()).stats);
                if (hRes.ok) setHistory((await hRes.json()).entries);
                if (bRes.ok) setBadges((await bRes.json()).badges);
                if (ssRes.ok) setSessions((await ssRes.json()).sessions);
                if (cRes.ok) setConcepts((await cRes.json()).concepts);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) {
        return (
            <main className="gs-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h1 className="gs-hero-title">Unauthorized</h1>
                <p className="gs-hero-sub">Please sign in to view your profile.</p>
                <Link href="/portal" className="gs-button gs-button-primary" style={{ marginTop: '2rem' }}>Go to Portal</Link>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="gs-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div className="gs-gate-loader"></div>
                <p className="gs-hero-sub" style={{ marginTop: '2rem' }}>Deciphering your mathematical journey...</p>
            </main>
        );
    }

    const earnedBadgeIds = badges.map(b => b.badge_id);

    return (
        <main className="profile-container gs-container" style={{ padding: '120px 20px 60px' }}>
            
            {/* Profile Header */}
            <section className="profile-header">
                <div className="avatar-circle-wrapper">
                    <div className="avatar-circle">
                        {user.email.substring(0, 1).toUpperCase()}
                    </div>
                </div>
                <div className="profile-info">
                    <h1 className="profile-email">{user.email.split('@')[0]}</h1>
                    <div className="profile-badges-inline">
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                    </div>
                    <div className="member-since">Member of the GanitSūtram Ecosystem</div>
                </div>
                <div className="profile-actions">
                    <button className="gs-button gs-button-ghost" onClick={logout}>Logout</button>
                </div>
            </section>

            {/* Badges Section */}
            <section className="gs-section">
                <h2 className="section-title">🏆 Achievement Badges</h2>
                <div className="badges-row">
                    {Object.entries(BADGE_VISUALS).map(([id, def]) => {
                        const earned = earnedBadgeIds.includes(id);
                        return (
                            <div key={id} className={`badge-item ${earned ? 'earned' : ''}`}>
                                {!earned && <div className="badge-lock">🔒</div>}
                                <div className="badge-icon">{def.icon}</div>
                                <div className="badge-title">{def.title}</div>
                                <div className="badge-desc">{def.desc}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Stats Grid */}
            <section className="stats-grid" style={{ marginTop: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Solved</div>
                    <div className="stat-value">{formatNumber(stats?.totalSolved || 0)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Current Streak</div>
                    <div className="stat-value">{formatNumber(stats?.streak || 0)} days</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Practice Accuracy</div>
                    <div className="stat-value">{formatNumber(practiceStats?.overallAccuracy || 0)}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Persona</div>
                    <div className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
            </section>

            <div className="panels-grid">
                {/* Mastery Panel */}
                <section className="panel">
                    <h2 className="section-title">🔥 Operation Mastery</h2>
                    <div className="mastery-list">
                        {stats?.operationBreakdown && Object.entries(stats.operationBreakdown).length > 0 ? (
                            Object.entries(stats.operationBreakdown).map(([op, count]: [string, any]) => {
                                const concept = concepts.find(c => c.id === op);
                                const pct = Math.min(100, (count / 20) * 100); // 20 solves for mastery
                                return (
                                    <div key={op} className="mastery-row">
                                        <div className="mastery-meta">
                                            <div className="mastery-name">{op.replace(/-/g, ' ').toUpperCase()}</div>
                                            <div className="mastery-sutra">{concept?.sutra}</div>
                                            <div style={{ fontSize: '0.75rem' }}>{formatNumber(count)} solves</div>
                                        </div>
                                        <div className="mastery-bar-outer">
                                            <div className="mastery-bar-inner" style={{ width: `${pct}%`, background: 'var(--accent-primary)' }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="history-empty">No operations solved yet.</div>
                        )}
                    </div>
                </section>

                {/* Practice Panel */}
                <section className="panel">
                    <h2 className="section-title">🎯 Practice Performance</h2>
                    {practiceStats?.byOperation && practiceStats.byOperation.length > 0 ? (
                        <div className="practice-details">
                            {practiceStats.byOperation.map((op: any) => (
                                <div key={op.operation} className="performance-row">
                                    <div style={{ fontWeight: 700 }}>{op.operation.replace(/-/g, ' ')}</div>
                                    <div style={{ fontSize: '0.8rem' }}>{formatNumber(op.correct)}/{formatNumber(op.attempts)}</div>
                                    <div className="perf-label-badge">{formatNumber(op.accuracy)}%</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="history-empty">No practice sessions recorded.</div>
                    )}
                </section>
            </div>

            {/* Solve History */}
            <section className="history-panel" style={{ marginTop: '4rem' }}>
                <h2 className="section-title">🕒 Solve History</h2>
                <div className="history-table-container">
                    <table className="gs-table">
                        <thead>
                            <tr>
                                <th>Operation</th>
                                <th>Input(s)</th>
                                <th>Result</th>
                                <th>Solved At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="history-op-cell">{entry.operation}</td>
                                        <td>{entry.input !== null ? formatNumber(entry.input) : `${formatNumber(entry.inputA)}, ${formatNumber(entry.inputB)}`}</td>
                                        <td className="history-result-cell">{formatNumber(entry.result)}</td>
                                        <td className="history-date-cell">{formatDate(entry.solvedAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="history-empty">Your journey awaits.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
