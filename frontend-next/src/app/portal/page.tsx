/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';

export default function PortalPage() {
    const { t } = useI18n();

    useEffect(() => {
        const reveals = document.querySelectorAll('.gs-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(el => observer.observe(el));
    }, []);

    return (
        <>
            <a href="#main-content" className="gs-skip-link">{t('common.skipToMain')}</a>

            <section className="gs-hero gs-gate-video" id="main-content">
                <div id="gs-archival-bg" className="gs-archival-bg">
                    <div className="nebula-bloom bloom-1"></div>
                    <div className="nebula-bloom bloom-2"></div>
                    <div className="nebula-bloom bloom-3"></div>
                    <div id="ring-overlay"></div>
                </div>
                <div className="gs-hero-inner">
                    <div className="gs-hero-eyebrow">
                        {t('hero.eyebrow')}
                    </div>
                    <div className="gs-hero-label">
                        <span className="gs-label-line"></span>
                        <span className="gs-label-text">{t('hero.label')}</span>
                        <span className="gs-label-line"></span>
                    </div>
                    <h1 className="gs-hero-title gs-title gs-gold-foil">
                        {t('hero.title')}<br />
                        <em>{t('hero.subtitle')}</em>
                    </h1>
                    <p className="gs-hero-sub">
                        {t('hero.description')}
                    </p>
                    <div className="gs-hero-cta">
                        <Link href="/gate" className="gs-button gs-button-primary">{t('hero.enterBtn')}</Link>
                        <Link href="/solver" className="gs-button gs-button-ghost">{t('nav.solver')}</Link>
                    </div>
                </div>
            </section>

            <div className="gs-container gs-reveal">
                <div className="gs-stats-bar">
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">7</span>
                        <span className="gs-stat-lbl">{t('stats.vedicOperations')}</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">8</span>
                        <span className="gs-stat-lbl">{t('stats.patternDiscoveries')}</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">16</span>
                        <span className="gs-stat-lbl">{t('stats.vedicSutras')}</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">1,500+</span>
                        <span className="gs-stat-lbl">{t('stats.yearsHeritage')}</span>
                    </div>
                </div>
            </div>

            <section className="gs-reveal" style={{ padding: '6rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="gs-container">
                    <div className="gs-section-label">{t('ecosystem.label')}</div>
                    <h2 className="gs-section-title gs-title gs-gold-foil">{t('ecosystem.title')}</h2>
                    <p className="gs-section-sub">{t('ecosystem.subtitle')}</p>
                    <div className="gs-platform-grid">
                        <Link href="/gate" className="gs-platform-card gs-card-featured">
                            <span className="gs-card-badge">{t('ecosystem.featuredBadge')}</span>
                            <span className="gs-card-icon">🚪</span>
                            <h3>{t('ecosystem.gateTitle')}</h3>
                            <p>{t('ecosystem.gateDesc')}</p>
                            <span className="gs-platform-link">{t('ecosystem.gateCTA')} &rarr;</span>
                        </Link>
                        <Link href="/solver" className="gs-platform-card">
                            <span className="gs-card-icon">⚡</span>
                            <h3>{t('solver.heading')}</h3>
                            <p>{t('solver.subheading')}</p>
                            <span className="gs-platform-link">{t('nav.solver')}</span>
                        </Link>
                        <Link href="/learning" className="gs-platform-card">
                            <span className="gs-card-icon">📚</span>
                            <h3>{t('learning.heading')}</h3>
                            <p>{t('learning.subheading')}</p>
                            <span className="gs-platform-link">{t('nav.learn')}</span>
                        </Link>
                    </div>
                </div>
            </section>

        </>
    );
}
