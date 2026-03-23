/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import ArchivalBg from '@/components/ArchivalBg';

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const { t } = useI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoading || !mounted) {
        return (
            <div className="gs-loader-container">
                <div className="gs-loader"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="gs-unauthorized-gate">
                <ArchivalBg />
                <div className="gs-unauthorized-content">
                    <span style={{ fontSize: '4rem', marginBottom: '2rem' }}>🛡️</span>
                    <h1 className="gs-title gs-gold-foil">{t('admin.unauthorized')}</h1>
                    <p style={{ color: 'var(--fg-muted)', marginBottom: '2rem' }}>
                        This sector of the archival system is restricted to administrators.
                    </p>
                    <Link href="/portal" className="gs-btn gs-btn-primary">{t('admin.backToPortal')}</Link>
                </div>
            </div>
        );
    }

    const metrics = [
        { label: t('admin.metricUsers'), value: '1,248', icon: '👥' },
        { label: t('admin.metricActive'), value: '42', icon: '🟢' },
        { label: t('admin.metricContent'), value: '3,150', icon: '📚' },
        { label: t('admin.metricUptime'), value: '99.98%', icon: '⚡' }
    ];

    const cards = [
        { 
            title: t('admin.cardCMSTitle'), 
            desc: t('admin.cardCMSDesc'), 
            icon: '✍️', 
            link: '/portal/cms', 
            action: t('admin.actionManage') 
        },
        { 
            title: t('admin.cardAnalyticsTitle'), 
            desc: t('admin.cardAnalyticsDesc'), 
            icon: '📊', 
            link: '/portal/analytics', 
            action: t('admin.actionView') 
        },
        { 
            title: t('admin.cardAPITitle'), 
            desc: t('admin.cardAPIDesc'), 
            icon: '🔌', 
            link: '/portal/api-docs', 
            action: t('admin.actionView') 
        },
        { 
            title: t('admin.cardUsersTitle'), 
            desc: t('admin.cardUsersDesc'), 
            icon: '🛡️', 
            link: '/portal/admin/users', 
            action: t('admin.actionManage'),
            disabled: true
        }
    ];

    return (
        <main id="main-content" className="gs-admin-dashboard">
            <header className="admin-hero">
                <div className="gs-container">
                    <div className="gs-hero-label">
                        <span className="gs-label-line"></span>
                        <span className="gs-label-text">{t('admin.title')}</span>
                        <span className="gs-label-line"></span>
                    </div>
                    <h1 className="gs-title gs-gold-foil" style={{ fontSize: '3.5rem' }}>{t('admin.subtitle')}</h1>
                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.2rem' }}>{t('admin.welcome')}</p>
                </div>
            </header>

            <div className="gs-container">
                {/* Metrics Row */}
                <div className="admin-stats-grid">
                    {metrics.map((m, i) => (
                        <div key={i} className="admin-stat-card gs-reveal visible">
                            <span className="stat-icon">{m.icon}</span>
                            <div className="stat-info">
                                <span className="stat-val">{m.value}</span>
                                <span className="stat-label">{m.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Cards */}
                <div className="admin-tools-grid">
                    {cards.map((c, i) => (
                        <div key={i} className={`admin-tool-card ${c.disabled ? 'disabled' : ''} gs-reveal visible`}>
                            <div className="tool-icon">{c.icon}</div>
                            <div className="tool-content">
                                <h3>{c.title}</h3>
                                <p>{c.desc}</p>
                                {c.disabled ? (
                                    <span className="tool-btn disabled">Coming Soon</span>
                                ) : (
                                    <Link href={c.link} className="tool-btn">{c.action}</Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feed & Status */}
                <div className="admin-lower-grid">
                    <section className="admin-section-block">
                        <h2 className="section-title">{t('admin.recentActivity')}</h2>
                        <div className="activity-feed">
                            <div className="activity-item">
                                <span className="act-dot"></span>
                                <div className="act-info">
                                    <p><strong>Nikhilam Multi</strong> sutra updated by Admin</p>
                                    <small>2 hours ago</small>
                                </div>
                            </div>
                            <div className="activity-item">
                                <span className="act-dot"></span>
                                <div className="act-info">
                                    <p>New discovery <strong>"Vedic Pi"</strong> published</p>
                                    <small>5 hours ago</small>
                                </div>
                            </div>
                            <div className="activity-item">
                                <span className="act-dot"></span>
                                <div className="act-info">
                                    <p>API load spike detected in Singapore node</p>
                                    <small>Yesterday</small>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="admin-section-block">
                        <h2 className="section-title">{t('admin.systemStatus')}</h2>
                        <div className="status-grid">
                            <div className="status-row">
                                <span className="status-lbl">Database Cluster</span>
                                <span className="status-pill healthy">HEALTHY</span>
                            </div>
                            <div className="status-row">
                                <span className="status-lbl">Auth Microservice</span>
                                <span className="status-pill healthy">ONLINE</span>
                            </div>
                            <div className="status-row">
                                <span className="status-lbl">Solver Engine v2.1</span>
                                <span className="status-pill warning">LATENCY</span>
                            </div>
                            <div className="status-row">
                                <span className="status-lbl">Edge CDN (AITDL)</span>
                                <span className="status-pill healthy">ACTIVE</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
