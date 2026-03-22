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
                        Ancient India's mental math system — rediscovered for the modern age.
                    </div>
                    <div className="gs-hero-label">
                        <span className="gs-label-line"></span>
                        <span className="gs-label-text">Ancient Mathematics. Modern Platform.</span>
                        <span className="gs-label-line"></span>
                    </div>
                    <h1 className="gs-hero-title">GanitSūtram<br /><em>गणितसूत्रम्</em></h1>
                    <p className="gs-hero-sub">
                        A living knowledge ecosystem built on Vedic mathematics,
                        pattern intelligence, and the ancient science of numbers.
                    </p>
                    <div className="gs-hero-cta">
                        <Link href="/gate" className="gs-btn gs-btn-primary">Explore Free &rarr;</Link>
                        <Link href="/solver" className="gs-btn gs-btn-secondary">Try the Solver</Link>
                    </div>
                </div>
            </section>

            {/* LIVE DEMO SECTION */}
            <section className="gs-demo-section">
                <div className="gs-container">
                    <div className="gs-section-label">Try It Live</div>
                    <h2 className="gs-section-title">Multiply 97 × 98 in 3 Steps</h2>
                    <p className="gs-demo-sub">Experience the Nikhilam Sutra — the method that predates calculators by 1,500 years.</p>
                    
                    <div className="gs-demo-widget">
                        <div className="gs-demo-steps">
                            <div className="gs-demo-step">
                                <div className="gs-demo-step-num">Step 1</div>
                                <div className="gs-demo-step-label">Find the deficiency from 100</div>
                                <div className="gs-demo-step-math">
                                    <div className="gs-demo-num">97 → 100 - 97 = <strong>3</strong></div>
                                    <div className="gs-demo-num">98 → 100 - 98 = <strong>2</strong></div>
                                </div>
                            </div>
                            <div className="gs-demo-step">
                                <div className="gs-demo-step-num">Step 2</div>
                                <div className="gs-demo-step-label">Cross-subtract for the left part</div>
                                <div className="gs-demo-step-math">
                                    <div className={`gs-demo-result ${demoSteps[1] ? 'revealed' : ''}`}>
                                        97 - 2 = <strong>95</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="gs-demo-step">
                                <div className="gs-demo-step-num">Step 3</div>
                                <div className="gs-demo-step-label">Multiply the deficiencies</div>
                                <div className="gs-demo-step-math">
                                    <div className={`gs-demo-result ${demoSteps[2] ? 'revealed' : ''}`}>
                                        3 × 2 = <strong>06</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className={`gs-demo-answer ${showResult ? 'revealed' : ''}`}>
                            <div className="gs-demo-answer-val">Result: 9506</div>
                            <div className="gs-demo-answer-sub">Combine the parts: 95 | 06</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS BAR */}
            <div className="gs-container">
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

            {/* PLATFORM GRID */}
            <section style={{ padding: '8rem 0' }}>
                <div className="gs-container">
                    <div className="gs-section-label">Ecosystem</div>
                    <h2 className="gs-section-title">The GanitSūtram Universe</h2>
                    <div className="gs-platform-grid">
                        <Link href="/gate" className="gs-platform-card">
                            <span className="gs-card-icon">🚪</span>
                            <h3>Enter Gate</h3>
                            <p>Select your persona — Student, Teacher, Explorer, School — and begin your journey.</p>
                            <span className="gs-platform-link">Learn More &rarr;</span>
                        </Link>
                        <Link href="/solver" className="gs-platform-card">
                            <span className="gs-card-icon">⚡</span>
                            <h3>Vedic Solver</h3>
                            <p>Compute any operation with step-by-step Vedic logic. Instant, visual, and explained.</p>
                            <span className="gs-platform-link">ganitsutram.com/solve</span>
                        </Link>
                        <Link href="/discoveries" className="gs-platform-card">
                            <span className="gs-card-icon">🔭</span>
                            <h3>Discoveries</h3>
                            <p>Explore mathematical patterns hidden in numbers — digital roots, casting out nines, and more.</p>
                            <span className="gs-platform-link">ganitsutram.com/discover</span>
                        </Link>
                        <Link href="/knowledge-map" className="gs-platform-card">
                            <span className="gs-card-icon">🗺️</span>
                            <h3>Knowledge Map</h3>
                            <p>Navigate the web of interconnected concepts — see how Vedic maths connects everything.</p>
                            <span className="gs-platform-link">ganitsutram.com/map</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* LINEAGE SECTION */}
            <section style={{ padding: '8rem 0', background: 'rgba(0,0,0,0.2)' }}>
                <div className="gs-container">
                    <div className="gs-section-label">Lineage</div>
                    <h2 className="gs-section-title">Standing on the Shoulders of Giants</h2>
                    <div className="gs-pillars">
                        <div className="gs-pillar">
                            <span className="gs-pillar-icon">आ</span>
                            <h3>Āryabhaṭa (476 CE)</h3>
                            <p>Pioneered the place-value system and zero, laying the structural foundation for modern math.</p>
                        </div>
                        <div className="gs-pillar">
                            <span className="gs-pillar-icon">ब्र</span>
                            <h3>Brahmagupta (598 CE)</h3>
                            <p>Established the definitive mathematical rules for computing with zero and negative numbers.</p>
                        </div>
                        <div className="gs-pillar">
                            <span className="gs-pillar-icon">भा</span>
                            <h3>Bhāskara II (1114 CE)</h3>
                            <p>Mastered advanced calculus concepts centuries before their European formalization.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUOTE WALL */}
            <section className="gs-quotes-section">
                <div className="gs-container">
                    <div className="gs-section-label">Voices</div>
                    <h2 className="gs-section-title">What the Great Minds Said</h2>
                    <div className="gs-quotes-grid">
                        <blockquote className="gs-tradition-quote">
                            <p>"Mathematics is the queen of the sciences, and number theory is the queen of mathematics."</p>
                            <cite>— Carl Friedrich Gauss</cite>
                        </blockquote>
                        <blockquote className="gs-tradition-quote">
                            <p>"As the crest of a peacock, as the gem on a serpent's head, so stands Mathematics at the top of all sciences."</p>
                            <cite>— Vedāṅga Jyotiṣa (1200 BCE)</cite>
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="gs-container">
                <div className="gs-final-cta">
                    <h2 className="gs-hero-title">Begin Your Mathematical Journey</h2>
                    <p className="gs-hero-sub">1,500 years of wisdom. One platform. Free to explore.</p>
                    <div className="gs-hero-cta">
                        <Link href="/gate" className="gs-btn gs-btn-primary">Enter the Gate &rarr;</Link>
                        <Link href="/solver" className="gs-btn gs-btn-secondary">Open Solver</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
