/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArchivalBg from '@/components/ArchivalBg';
import { useI18n } from '@/context/I18nContext';

export default function Gate() {
    const { t, locale } = useI18n();
    const router = useRouter();
    const [scene, setScene] = useState(1);
    const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

    const personas = [
        { id: 'student', icon: '01', label: 'Student', desc: 'Explore Vedic maths, practise problems, and track your learning progress.', best: 'Best for: School & college learners', url: '/learning' },
        { id: 'teacher', icon: '02', label: 'Teacher', desc: 'Access classroom tools, concept libraries, and student progress dashboards.', best: 'Best for: Educators & tutors', url: '/learning' },
        { id: 'parent', icon: '03', label: 'Parent', desc: "Guide your child's mathematical journey with curated resources.", best: 'Best for: Parents & guardians', url: '/learning' },
        { id: 'adult', icon: '04', label: 'Adult Learner', desc: 'Rediscover mathematics at your own pace with structured adult pathways.', best: 'Best for: Self-paced learners', url: '/solver' },
        { id: 'school', icon: '05', label: 'School / Institution', desc: 'Institution-level tools, curriculum alignment, and research lab access.', best: 'Best for: Schools & universities', url: '/research' },
        { id: 'explore', icon: '06', label: 'Explore Maths', desc: 'No agenda. Just curiosity. Dive into patterns, discoveries, and the beauty of numbers.', best: 'Best for: The curious & explorers', url: '/discoveries' },
    ];

    const handleBegin = () => setScene(2);
    
    const handleSelect = (id: string) => {
        setSelectedPersona(id);
    };

    const handleProceed = () => {
        if (!selectedPersona) return;
        setScene(3);
        const persona = personas.find(p => p.id === selectedPersona);
        setTimeout(() => {
            if (persona) router.push(persona.url);
        }, 2000);
    };

    return (
        <main id="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
            <ArchivalBg />
            <div className="gs-gate-container">
                
                {/* SCENE 1: INTRODUCTION */}
                <section className={`gs-scene ${scene === 1 ? 'active' : ''}`}>
                    <div className="gs-gate-progress">
                        <span className="gs-gate-step active">1</span>
                        <span className="gs-gate-step-line"></span>
                        <span className="gs-gate-step">2</span>
                    </div>
                    <div className="gs-section-label">Gateway</div>
                    <h1 className="gs-hero-title">Enter the Mathematical Universe</h1>
                    <p className="gs-hero-sub">1,500 years of Vedic wisdom — choose your pathway to mathematical clarity.</p>

                    <div className="gs-gate-actions">
                        <button className="gs-btn gs-btn-primary" onClick={handleBegin}>
                            Begin Your Journey &rarr;
                        </button>
                    </div>
                </section>

                {/* SCENE 2: PERSONA SELECTION */}
                <section className={`gs-scene ${scene === 2 ? 'active' : ''}`}>
                    <div className="gs-gate-progress">
                        <span className="gs-gate-step">1</span>
                        <span className="gs-gate-step-line active"></span>
                        <span className="gs-gate-step active">2</span>
                    </div>
                    <div className="gs-section-label">The Gate</div>
                    <h2 className="gs-section-title">Who are you?</h2>
                    <p className="gs-hero-sub" style={{ marginBottom: '2rem' }}>Select your role to personalise your experience</p>

                    <div className="gs-persona-grid">
                        {personas.map(p => (
                            <div 
                                key={p.id} 
                                className={`gs-persona-card ${selectedPersona === p.id ? 'selected' : ''}`}
                                onClick={() => handleSelect(p.id)}
                            >
                                <div className="gs-persona-icon">{p.icon}</div>
                                <h3>{p.label}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                                    {p.desc}
                                </p>
                                <div className="gs-persona-best">{p.best}</div>
                            </div>
                        ))}
                    </div>

                    <div className="gs-gate-actions">
                        <button 
                            className={`gs-btn gs-btn-primary ${!selectedPersona ? 'disabled' : ''}`} 
                            disabled={!selectedPersona}
                            onClick={handleProceed}
                        >
                            Enter Platform &rarr;
                        </button>
                    </div>
                </section>

                {/* SCENE 3: REDIRECT */}
                <section className={`gs-scene ${scene === 3 ? 'active' : ''}`}>
                    <div className="gs-gate-loader"></div>
                    <h2 className="gs-section-title" style={{ marginTop: '2rem' }}>
                        Synchronizing...
                    </h2>
                    <p className="gs-hero-sub">Deciphering the mathematical pathway to your world.</p>
                </section>

            </div>
        </main>
    );
}
