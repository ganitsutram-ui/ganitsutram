/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';

interface Module {
    id: string;
    title: string;
    sutra?: string;
    desc: string;
    icon?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    link: string;
    category: string;
}

const PERSONA_CONFIG: Record<string, { title: string; desc: string; color: string }> = {
    student: {
        title: 'Student Path',
        desc: 'Structured modules from basics to advanced Vedic techniques.',
        color: '#ff5500',
    },
    teacher: {
        title: 'Teacher\'s Toolkit',
        desc: 'Classroom-ready resources, explanations, and pattern references.',
        color: '#7b5ea7',
    },
    parent: {
        title: 'Parent Guide',
        desc: 'Help your child explore mathematics with joy and confidence.',
        color: '#00a8b0',
    },
    adult: {
        title: 'Adult Learner',
        desc: 'Self-paced modules designed for curious adult minds.',
        color: '#e8a020',
    },
};

// Static module definitions by persona
const MODULES_BY_PERSONA: Record<string, Module[]> = {
    student: [
        { id: 'digital-root', title: 'Digital Root (Beejank)', sutra: 'बीजांक', desc: 'Reduce any number to a single digit instantly.', icon: '🔢', difficulty: 'beginner', link: '/solver?op=digital-root', category: 'Core' },
        { id: 'squares-5', title: 'Squares Ending in 5', sutra: 'एकाधिकेन पूर्वेण', desc: 'Square numbers ending in 5 in one second.', icon: '⬛', difficulty: 'beginner', link: '/solver?op=squares-ending-5', category: 'Vedic' },
        { id: 'multiply-11', title: 'Multiply by 11', sutra: 'एकन्यूनेन पूर्वेण', desc: 'Instantly multiply any number by 11.', icon: '✖️', difficulty: 'beginner', link: '/solver?op=multiply-by-11', category: 'Core' },
        { id: 'nikhilam', title: 'Nikhilam Multiplication', sutra: 'निखिलं नवतश्चरमं', desc: 'Multiply numbers near powers of 10.', icon: '🔄', difficulty: 'intermediate', link: '/solver?op=nikhilam', category: 'Vedic' },
        { id: 'urdhva', title: 'Urdhva Tiryak', sutra: 'ऊर्ध्वतिर्यग्भ्याम्', desc: 'General cross multiplication for any numbers.', icon: '⬆️', difficulty: 'advanced', link: '/solver?op=urdhva', category: 'Vedic' },
        { id: 'kaprekar', title: 'Kaprekar Constant', sutra: 'चक्रवाल', desc: 'Discover 6174 — the magic of 4-digit numbers.', icon: '🔁', difficulty: 'intermediate', link: '/solver?op=kaprekar', category: 'Pattern' },
    ],
    teacher: [
        { id: 'digital-root', title: 'Digital Root Classroom Demo', sutra: 'बीजांक', desc: 'Visual explanation of digital root for classroom use.', icon: '👩‍🏫', difficulty: 'beginner', link: '/discoveries', category: 'Core' },
        { id: 'number-patterns', title: 'Number Patterns Archive', sutra: 'आनुरूप्येण', desc: 'A full archive of discoverable patterns for lesson plans.', icon: '📚', difficulty: 'beginner', link: '/discoveries', category: 'Patterns' },
        { id: 'fibonacci', title: 'Fibonacci & Digital Roots', sutra: 'आनुरूप्येण', desc: 'The 24-step cycle for engaging classroom exploration.', icon: '🌀', difficulty: 'intermediate', link: '/solver?op=fibonacci', category: 'Pattern' },
        { id: 'knowledge-map', title: 'Knowledge Graph Map', sutra: 'सर्वम् एकम्', desc: 'Visual connectivity of all Vedic mathematical concepts.', icon: '🌐', difficulty: 'beginner', link: '/knowledge-map', category: 'Reference' },
    ],
    parent: [
        { id: 'intro', title: 'What is Vedic Mathematics?', sutra: 'बीजांक', desc: 'A gentle introduction to ancient Indian mathematics.', icon: '📖', difficulty: 'beginner', link: '/discoveries', category: 'Foundation' },
        { id: 'digital-root', title: 'Digital Root — Start Here', sutra: 'बीजांक', desc: 'The easiest first step for children aged 8+.', icon: '🔢', difficulty: 'beginner', link: '/solver?op=digital-root', category: 'Core' },
        { id: 'kaprekar', title: 'Fun: Kaprekar\'s Magic Number', sutra: 'चक्रवाल', desc: 'A magical number trick kids will love.', icon: '🎩', difficulty: 'beginner', link: '/solver?op=kaprekar', category: 'Pattern' },
    ],
    adult: [
        { id: 'digital-root', title: 'Digital Root Mastery', sutra: 'बीजांक', desc: 'Master the foundational concept in under 10 minutes.', icon: '🔢', difficulty: 'beginner', link: '/solver?op=digital-root', category: 'Core' },
        { id: 'nikhilam', title: 'Speed Arithmetic: Nikhilam', sutra: 'निखिलं', desc: 'Cut multiplication time using base subtraction.', icon: '⚡', difficulty: 'intermediate', link: '/solver?op=nikhilam', category: 'Vedic' },
        { id: 'urdhva', title: 'Advanced: Urdhva Tiryak', sutra: 'ऊर्ध्वतिर्यग्भ्याम्', desc: 'The universal multiplication algorithm.', icon: '⬆️', difficulty: 'advanced', link: '/solver?op=urdhva', category: 'Vedic' },
        { id: 'fibonacci', title: 'Fibonacci Pattern Analysis', sutra: 'आनुरूप्येण', desc: 'Explore the 24-step digital root cycle deep dive.', icon: '🌀', difficulty: 'advanced', link: '/solver?op=fibonacci', category: 'Pattern' },
        { id: 'knowledge-map', title: 'Full Knowledge Graph', sutra: 'सर्वम् एकम्', desc: 'Explore the complete universe of Vedic concepts.', icon: '🌐', difficulty: 'beginner', link: '/knowledge-map', category: 'Reference' },
    ],
};

const DIFF_COLORS: Record<string, string> = {
    beginner: '#27ae60',
    intermediate: '#e8a020',
    advanced: '#e74c3c',
};

export default function LearningPage() {
    const { t } = useI18n();
    const [persona, setPersona] = useState<'student' | 'teacher' | 'parent' | 'adult'>('student');
    const [modules, setModules] = useState<Module[]>(MODULES_BY_PERSONA['student']);
    const [discoveries, setDiscoveries] = useState<any[]>([]);

    // Load saved persona
    useEffect(() => {
        const saved = localStorage.getItem('gs_persona') as any;
        if (saved && MODULES_BY_PERSONA[saved]) {
            setPersona(saved);
            setModules(MODULES_BY_PERSONA[saved]);
        }
    }, []);

    // Fetch extra discovery count from backend
    useEffect(() => {
        fetch('/api/discoveries').then(r => r.json()).then(d => {
            if (d.discoveries) setDiscoveries(d.discoveries);
        }).catch(() => {});
    }, []);

    const switchPersona = (p: typeof persona) => {
        setPersona(p);
        setModules(MODULES_BY_PERSONA[p]);
        localStorage.setItem('gs_persona', p);
    };

    const config = PERSONA_CONFIG[persona];

    return (
        <>
            <a href="#main-content" className="gs-skip-link">Skip to main content</a>
            <main id="main-content">
                <div className="gs-container">

                    {/* Hero */}
                    <section className="gs-learning-hero" style={{ paddingTop: '120px', textAlign: 'center', paddingBottom: '3rem' }}>
                        <div className="gs-sanskrit-line">विद्या ददाति विनयम्</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                            Knowledge brings humility.
                        </div>
                        <h1 className="gs-hero-title">Learning Paths</h1>
                        <p className="gs-hero-sub">Your path. Your pace. Ancient wisdom for the modern mind.</p>

                        {/* Stats bar */}
                        {discoveries.length > 0 && (
                            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{discoveries.length}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>Discoveries</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>9</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>Vedic Sutras</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>∞</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>Patterns</div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Persona Tabs */}
                    <section className="gs-tab-container" style={{ marginBottom: '3rem' }}>
                        <div className="gs-tabs" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {Object.keys(PERSONA_CONFIG).map(p => (
                                <button
                                    key={p}
                                    className={`gs-tab-btn ${persona === p ? 'active' : ''}`}
                                    onClick={() => switchPersona(p as typeof persona)}
                                    style={{
                                        borderColor: persona === p ? PERSONA_CONFIG[p].color : '',
                                        color: persona === p ? PERSONA_CONFIG[p].color : '',
                                    }}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Panel Header */}
                        <div className="gs-tab-panel active" style={{ marginTop: '2rem' }}>
                            <div className="gs-panel-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                <h2 className="gs-panel-title" style={{ color: config.color }}>{config.title}</h2>
                                <p className="gs-panel-desc">{config.desc}</p>
                            </div>

                            {/* Module Grid */}
                            <div className="gs-module-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem',
                            }}>
                                {modules.map(mod => (
                                    <Link key={mod.id} href={mod.link} className="gs-discovery-card" style={{ textDecoration: 'none', display: 'block' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div className="gs-discovery-icon" style={{ fontSize: '1.8rem' }}>{mod.icon || '📐'}</div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mod.category}</div>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{mod.title}</h3>
                                            </div>
                                        </div>
                                        {mod.sutra && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-soft, #ffb347)', fontStyle: 'italic', marginBottom: '0.5rem' }}>{mod.sutra}</div>
                                        )}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', margin: '0 0 1rem' }}>{mod.desc}</p>
                                        <div className="gs-discovery-footer">
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: DIFF_COLORS[mod.difficulty] + '22',
                                                color: DIFF_COLORS[mod.difficulty],
                                                border: `1px solid ${DIFF_COLORS[mod.difficulty]}44`,
                                                textTransform: 'capitalize',
                                            }}>{mod.difficulty}</span>
                                            <span className="gs-discovery-link">Start →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
                        <Link href="/discoveries" className="gs-button gs-button-secondary">📚 All Discoveries</Link>
                        <Link href="/solver" className="gs-button gs-button-primary">⚡ Open Solver</Link>
                        <Link href="/knowledge-map" className="gs-button gs-button-secondary">🌐 Knowledge Map</Link>
                        <Link href="/learning/profile" className="gs-button gs-button-secondary">👤 My Profile</Link>
                    </section>

                    {/* Nudge Banner */}
                    <section className="gs-nudge-banner" style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid rgba(255,85,0,0.2)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        marginBottom: '4rem',
                    }}>
                        <div className="gs-nudge-text" style={{ marginBottom: '1rem', color: 'var(--fg-muted)' }}>
                            Save your progress — create a free account to track your mathematical journey.
                        </div>
                        <Link href="/portal" className="gs-button gs-button-primary">Sign Up Free →</Link>
                    </section>
                </div>
            </main>
        </>
    );
}
