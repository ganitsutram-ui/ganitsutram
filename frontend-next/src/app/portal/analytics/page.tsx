/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';

export default function Analytics() {
    const { t } = useI18n();
    const [realtime, setRealtime] = useState({ activeUsers: 42, activeSolves: 128, serverLoad: '12%', status: 'N/A' });
    const [dashboard, setDashboard] = useState<any>(null);

    // Mock data for initial implementation
    useEffect(() => {
        const mockData = {
            summary: [
                { label: 'Total Users', value: '1,280', change: '+12%' },
                { label: 'Avg Solve Time', value: '1.4s', change: '-0.2s' },
                { label: 'Pattern Matches', value: '8,421', change: '+18%' },
                { label: 'Success Rate', value: '94.2%', change: '+1.5%' }
            ],
            dau: Array.from({ length: 14 }, (_, i) => ({ 
                date: `Mar ${i + 1}`, 
                value: Math.floor(Math.random() * 200) + 100 
            })),
            solves: Array.from({ length: 14 }, (_, i) => ({ 
                date: `Mar ${i + 1}`, 
                value: Math.floor(Math.random() * 500) + 300 
            })),
            accuracy: 94,
            topOps: [
                { op: 'Nikhilam Multiplication', calls: '4,210', share: '42%' },
                { op: 'Ekadhikena Square', calls: '1,850', share: '18%' },
                { op: 'Digital Root', calls: '1,240', share: '12%' },
                { op: 'Multiplication by 11', calls: '980', share: '9%' }
            ],
            events: [
                { type: 'Page View', count: '12,402' },
                { type: 'Solve Operation', count: '8,421' },
                { type: 'Concept Explorer', count: '3,150' },
                { type: 'Profile Update', count: '420' }
            ]
        };
        setDashboard(mockData);

        const interval = setInterval(() => {
            setRealtime(prev => ({
                ...prev,
                activeUsers: prev.activeUsers + (Math.random() > 0.5 ? 1 : -1),
                activeSolves: prev.activeSolves + (Math.random() > 0.5 ? 2 : -2)
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    if (!dashboard) return <div>Loading Analytics...</div>;

    return (
        <main id="main-content" className="admin-body">
            {/* Realtime HUD */}
            <div className="realtime-strip">
                <div className="realtime-header">
                    <span className="pulse-dot"></span> LIVE TELEMETRY
                </div>
                <div className="rt-grid">
                    <div className="rt-item">
                        <span className="rt-val">{realtime.activeUsers}</span>
                        <span className="rt-lbl">Active Users</span>
                    </div>
                    <div className="rt-item">
                        <span className="rt-val">{realtime.activeSolves}</span>
                        <span className="rt-lbl">Vedic Solves/min</span>
                    </div>
                    <div className="rt-item">
                        <span className="rt-val">{realtime.serverLoad}</span>
                        <span className="rt-lbl">Server Load</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-wrap">
                <div className="dashboard-header">
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-logo)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            Platform Analytics <span style={{ fontSize: '0.4em', background: 'var(--accent-primary)', color: '#fff', padding: '4px 10px', borderRadius: '4px', verticalAlign: 'middle' }}>ADMIN</span>
                        </h1>
                        <p style={{ color: 'var(--fg-muted)' }}>Real-time usage metrics and progression geometry.</p>
                    </div>
                    <div className="dashboard-controls">
                        <button className="gs-btn gs-btn-secondary">Export Data</button>
                    </div>
                </div>

                {/* Summary Row */}
                <section className="summary-grid">
                    {dashboard.summary.map((s: any, i: number) => (
                        <div key={i} className="summary-card">
                            <div className="summary-val">{s.value}</div>
                            <div className="summary-lbl">{s.label} <span style={{ color: '#22c55e', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{s.change}</span></div>
                        </div>
                    ))}
                </section>

                {/* Charts Grid */}
                <div className="charts-row">
                    <div className="chart-card">
                        <h3>Daily Active Users</h3>
                        <div className="chart-container">
                            {dashboard.dau.map((d: any, i: number) => (
                                <div key={i} className="bar-wrap">
                                    <div className="bar-tooltip">{d.value}</div>
                                    <div className="bar" style={{ height: `${(d.value / 300) * 100}%` }}></div>
                                    <div className="bar-label">{d.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="chart-card">
                        <h3>Vedic Solves Volume</h3>
                        <div className="chart-container">
                            {dashboard.solves.map((d: any, i: number) => (
                                <div key={i} className="bar-wrap">
                                    <div className="bar-tooltip">{d.value}</div>
                                    <div className="bar" style={{ height: `${(d.value / 800) * 100}%` }}></div>
                                    <div className="bar-label">{d.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Accuracy and Stats */}
                <div className="charts-row">
                    <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3>Practice Accuracy</h3>
                        <div className="accuracy-panel">
                            <div className="acc-big">{dashboard.accuracy}%</div>
                            <div className="acc-sub">Overall student precision this period</div>
                        </div>
                    </div>
                    <div className="chart-card">
                        <h3>Distribution of Activity</h3>
                        <table className="gs-table">
                            <thead>
                                <tr>
                                    <th>Event Type</th>
                                    <th>Total Occurrences</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.events.map((e: any, i: number) => (
                                    <tr key={i}>
                                        <td>{e.type}</td>
                                        <td>{e.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Operations Table */}
                <div className="chart-card">
                    <h3>Most Frequently Used Vedic Operations</h3>
                    <table className="gs-table">
                        <thead>
                            <tr>
                                <th>Method / Sūtra</th>
                                <th>Total Solves</th>
                                <th>Platform Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.topOps.map((op: any, i: number) => (
                                <tr key={i}>
                                    <td><strong>{op.op}</strong></td>
                                    <td>{op.calls}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: op.share, height: '100%', background: 'var(--accent-primary)' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', width: '40px' }}>{op.share}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
