/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function PortalPage() {
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
            <a href="#main-content" className="gs-skip-link">Skip to main content</a>

            <section className="gs-hero gs-gate-video" id="main-content">
                <div id="gs-archival-bg" className="gs-archival-bg">
                    <div className="nebula-bloom bloom-1"></div>
                    <div className="nebula-bloom bloom-2"></div>
                    <div className="nebula-bloom bloom-3"></div>
                    <div id="ring-overlay"></div>
                </div>
                <div className="gs-hero-inner">
                    <div className="gs-hero-eyebrow">
                        Ancient India's mental math system — rediscovered for the modern age.
                    </div>
                    <div className="gs-hero-label">
                        <span className="gs-label-line"></span>
                        <span className="gs-label-text">Ancient Mathematics. Modern Platform.</span>
                        <span className="gs-label-line"></span>
                    </div>
                    <h1 className="gs-hero-title gs-title gs-gold-foil">GanitSūtram<br /><em>गणितसूत्रम्</em></h1>
                    <p className="gs-hero-sub">
                        A living knowledge ecosystem built on Vedic mathematics,
                        pattern intelligence, and the ancient science of numbers.
                    </p>
                    <div className="gs-hero-cta">
                        <Link href="/gate" className="gs-button gs-button-primary">Explore Free &rarr;</Link>
                        <Link href="/solver" className="gs-button gs-button-ghost">Try the Solver</Link>
                    </div>
                </div>
            </section>

            <div className="gs-container gs-reveal">
                <div className="gs-stats-bar">
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">7</span>
                        <span className="gs-stat-lbl">Vedic Operations</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">8</span>
                        <span className="gs-stat-lbl">Pattern Discoveries</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">16</span>
                        <span className="gs-stat-lbl">Vedic Sūtras</span>
                    </div>
                    <div className="gs-stat-item">
                        <span className="gs-stat-val">1,500+</span>
                        <span className="gs-stat-lbl">Years of Heritage</span>
                    </div>
                </div>
            </div>

            <section className="gs-reveal" style={{ padding: '6rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="gs-container">
                    <div className="gs-section-label">Ecosystem</div>
                    <h2 className="gs-section-title gs-title gs-gold-foil">The GanitSūtram Universe</h2>
                    <p className="gs-section-sub">Every module is a doorway. Choose your path.</p>
                    <div className="gs-platform-grid">
                        <Link href="/gate" className="gs-platform-card gs-card-featured">
                            <span className="gs-card-badge">Start Here</span>
                            <span className="gs-card-icon">🚪</span>
                            <h3>Enter Gate</h3>
                            <p>Select your persona — Student, Teacher, Explorer, School — and begin your journey.</p>
                            <span className="gs-platform-link">Your Path Starts Here &rarr;</span>
                        </Link>
                        <Link href="/solver" className="gs-platform-card">
                            <span className="gs-card-icon">⚡</span>
                            <h3>Vedic Solver</h3>
                            <p>Compute any operation with step-by-step Vedic logic. Instant, visual, and explained.</p>
                            <span className="gs-platform-link">ganitsutram.com/solve</span>
                        </Link>
                        <Link href="/learning" className="gs-platform-card">
                            <span className="gs-card-icon">📚</span>
                            <h3>Learning Hub</h3>
                            <p>Persona-driven paths for every kind of learner — structured, adaptive, immersive.</p>
                            <span className="gs-platform-link">ganitsutram.com/learn</span>
                        </Link>
                    </div>
                </div>
            </section>

        </>
    );
}
