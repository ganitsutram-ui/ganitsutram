/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ArchivalBg from '@/components/ArchivalBg';
import { useI18n } from '@/context/I18nContext';

export default function Home() {
    const { t, locale } = useI18n();
    const [demoSteps, setDemoSteps] = useState([false, false, false]);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const sequence = async () => {
                for (let i = 0; i < 3; i++) {
                    await new Promise(r => setTimeout(r, 800));
                    setDemoSteps(prev => {
                        const next = [...prev];
                        next[i] = true;
                        return next;
                    });
                }
                await new Promise(r => setTimeout(r, 600));
                setShowResult(true);
            };
            sequence();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    return (
        <main id="main-content">
            {/* HERO SECTION */}
            <section className="gs-hero">
                <ArchivalBg />
                <div className="gs-hero-inner">
                    <div className="gs-hero-eyebrow">
                        {t('hero.eyebrow')}
                    </div>
                    <div className="gs-hero-label">
                        <span className="gs-label-line"></span>
                        <span className="gs-label-text">{t('hero.label')}</span>
                        <span className="gs-label-line"></span>
                    </div>
                    <h1 className="gs-hero-title">{t('hero.title')}<br /><em>{t('hero.subtitle')}</em></h1>
                    <p className="gs-hero-sub">
                        {t('hero.description')}
                    </p>
                    <div className="gs-hero-cta">
                        <Link href="/gate" className="gs-btn gs-btn-primary">{t('hero.exploreBtn')}</Link>
                        <Link href="/solver" className="gs-btn gs-btn-secondary">{t('nav.solver')}</Link>
                    </div>
                </div>
            </section>

            {/* LIVE DEMO SECTION */}
            <section className="gs-demo-section">
                <div className="gs-container">
                    <div className="gs-section-label">{t('demo.label')}</div>
                    <h2 className="gs-section-title">{t('demo.title')}</h2>
                    <p className="gs-demo-sub">{t('demo.subtitle')}</p>
                    
                    <div className="gs-demo-widget">
                        <div className="gs-demo-steps">
                            <div className="gs-demo-step">
                                <div className="gs-demo-step-num">{t('demo.step')} 1</div>
                                <div className="gs-demo-step-label">{t('demo.step1Desc')}</div>
                                <div className="gs-demo-step-math">
                                    <div className="gs-demo-num">{t('demo.demo97')}<strong>3</strong></div>
                                    <div className="gs-demo-num">{t('demo.demo98')}<strong>2</strong></div>
                                </div>
                            </div>
                            <div className="gs-demo-step">
                                <div className="gs-demo-step-num">{t('demo.step')} 2</div>
                                <div className="gs-demo-step-label">{t('demo.step2Desc')}</div>
                                <div className="gs-demo-step-math">
                                    <div className={`gs-demo-result ${demoSteps[1] ? 'revealed' : ''}`}>
                                        {t('demo.demoSub')}<strong>95</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="gs-demo-step">
                                <div className="gs-demo-step-num">{t('demo.step')} 3</div>
                                <div className="gs-demo-step-label">{t('demo.step3Desc')}</div>
                                <div className="gs-demo-step-math">
                                    <div className={`gs-demo-result ${demoSteps[2] ? 'revealed' : ''}`}>
                                        {t('demo.demoMul')}<strong>06</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className={`gs-demo-answer ${showResult ? 'revealed' : ''}`}>
                            <div className="gs-demo-answer-val">{t('demo.result')}: {t('demo.demoAns')}</div>
                            <div className="gs-demo-answer-sub">{t('demo.combine')}: {t('demo.demoParts')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS BAR */}
            <div className="gs-container">
                <div className="gs-stats-bar">
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">{t('stats.valOperations')}</span>
                        <span className="gs-stat-lbl">{t('stats.vedicOperations')}</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">{t('stats.valDiscoveries')}</span>
                        <span className="gs-stat-lbl">{t('stats.patternDiscoveries')}</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">{t('stats.valSutras')}</span>
                        <span className="gs-stat-lbl">{t('stats.vedicSutras')}</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">{t('stats.valHeritage')}</span>
                        <span className="gs-stat-lbl">{t('stats.yearsHeritage')}</span>
                    </div>
                </div>
            </div>

            {/* PLATFORM GRID */}
            <section style={{ padding: '8rem 0' }}>
                <div className="gs-container">
                    <div className="gs-section-label">{t('ecosystem.label')}</div>
                    <h2 className="gs-section-title">{t('ecosystem.title')}</h2>
                    <div className="gs-platform-grid">
                        <Link href="/gate" className="gs-platform-card">
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
                        <Link href="/discoveries" className="gs-platform-card">
                            <span className="gs-card-icon">🔭</span>
                            <h3>{t('discoveries.heading')}</h3>
                            <p>{t('discoveries.subheading')}</p>
                            <span className="gs-platform-link">{t('discoveries.exploreBtn')}</span>
                        </Link>
                        <Link href="/knowledge-map" className="gs-platform-card">
                            <span className="gs-card-icon">🗺️</span>
                            <h3>{t('search.knowledgeMap')}</h3>
                            <p>{t('search.visualizeCosmic')}</p>
                            <span className="gs-platform-link">{t('search.viewGraph')}</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* LINEAGE SECTION */}
            <section style={{ padding: '8rem 0', background: 'rgba(0,0,0,0.2)' }}>
                <div className="gs-container">
                    <div className="gs-section-label">{t('lineage.label')}</div>
                    <h2 className="gs-section-title">{t('lineage.title')}</h2>
                    <div className="gs-pillars">
                        <div className="gs-pillar">
                            <span className="gs-pillar-icon">आ</span>
                            <h3>{t('lineage.aryabhataName')}</h3>
                            <p>{t('lineage.aryabhata')}</p>
                        </div>
                        <div className="gs-pillar">
                            <span className="gs-pillar-icon">ब्र</span>
                            <h3>{t('lineage.brahmaguptaName')}</h3>
                            <p>{t('lineage.brahmagupta')}</p>
                        </div>
                        <div className="gs-pillar">
                            <span className="gs-pillar-icon">भा</span>
                            <h3>{t('lineage.bhaskaraName')}</h3>
                            <p>{t('lineage.bhaskara')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUOTE WALL */}
            <section className="gs-quotes-section">
                <div className="gs-container">
                    <div className="gs-section-label">{t('voices.label')}</div>
                    <h2 className="gs-section-title">{t('voices.title')}</h2>
                    <div className="gs-quotes-grid">
                        <blockquote className="gs-tradition-quote">
                            <p>"{t('voices.quoteGauss')}"</p>
                            <cite>— {t('voices.citeGauss')}</cite>
                        </blockquote>
                        <blockquote className="gs-tradition-quote">
                            <p>"{t('voices.quoteVeda')}"</p>
                            <cite>— {t('voices.citeVeda')}</cite>
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="gs-container">
                <div className="gs-final-cta">
                    <h2 className="gs-hero-title">{t('hero.title')}</h2>
                    <p className="gs-hero-sub">{t('common.tagline')}</p>
                    <div className="gs-hero-cta">
                        <Link href="/gate" className="gs-btn gs-btn-primary">{t('ecosystem.gateCTA')} &rarr;</Link>
                        <Link href="/solver" className="gs-btn gs-btn-secondary">{t('nav.solver')}</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
