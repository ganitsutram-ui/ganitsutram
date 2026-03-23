"use client";

/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
*/

import { useState, useEffect } from 'react';
import Link from 'next/link';

const QUOTES = [
    {
        type: 'ऋषि का व्यंग्य (Rishi ka Joke) 😄',
        title: 'यह पृष्ठ शून्य में चला गया...',
        body: 'हे वत्स! लगता है तुमने किसी मायावी लिंक पर क्लिक कर दिया है। यह पथ अब हमारे सर्वर के तपोवन में नहीं है।',
        equation: {
            label: 'GaṇitSūtram प्रमाण',
            part1: 'अरे', op1: '×', part2: 'वृ७', op2: '=', result: '४०४ → Ø',
        },
    },
    {
        type: 'जीवन का सत्य (Life Lesson) 🌿',
        title: 'मार्ग भटकना भी एक शिक्षा है...',
        body: 'जैसे संसार में जीव माया के जाल में भटक जाता है, वैसे ही तुम भी इस 404 के मायाजाल में आ फँसे हो। लौट जाओ वत्स!',
        equation: {
            label: 'जीवन सूत्र',
            part1: 'भ्रम', op1: '+', part2: 'अज्ञान', op2: '=', result: '४०४ (शून्य)',
        },
    },
    {
        type: 'वैदिक सिद्धांत (Vedic Formula) 🔢',
        title: 'शून्य का रहस्य (४०४)',
        body: 'आर्यभट्टजी ने शून्य (0) दिया, परंतु तुमने 404 खोज निकाला! गणित में जो नहीं है, उसे खोजना व्यर्थ है।',
        equation: {
            label: 'शून्यसिद्धांत',
            part1: '४०४', op1: '÷', part2: '०', op2: '=', result: 'अपरिभाषित (∞)',
        },
    },
];

// Forced light theme CSS variables on the root <main> element
const LIGHT_THEME: React.CSSProperties = {
    ['--bg-primary' as string]: '#FAFAFA',
    ['--bg-secondary' as string]: '#F0F2F5',
    ['--fg-main' as string]: '#0F172A',
    ['--fg-muted' as string]: '#475569',
    ['--accent-primary' as string]: '#EA580C',
    ['--accent-soft' as string]: '#F97316',
    ['--accent-secondary' as string]: '#B45309',
    ['--glass-bg' as string]: 'rgba(255,255,255,0.75)',
    ['--glass-border' as string]: 'rgba(0,0,0,0.12)',
    backgroundColor: '#FAFAFA',
    color: '#0F172A',
};

export default function NotFoundClient() {
    const [idx, setIdx] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIdx(Math.floor(Math.random() * QUOTES.length));
    }, []);

    const current = QUOTES[idx];
    const nextQuote = () => setIdx((prev) => (prev + 1) % QUOTES.length);

    return (
        <main className="gs-404-page" style={LIGHT_THEME}>
            <div className="gs-404-inner gs-container page-404-layout">

                {/* LEFT — RISHI & THOUGHT BUBBLE */}
                <div className="rishi-panel">
                    <div className="scroll-wrap">
                        <img
                            src="/assets/img/Rishi-404.svg"
                            alt="Confused Rishi"
                            className="scroll-img"
                        />
                        <div className="thought-bubble" style={{ maxWidth: '220px', padding: '1rem 1.2rem', top: '-12%', right: '-16%' }}>
                            <span className="thought-deva" style={{ fontSize: '1.05rem', lineHeight: '1.45', color: '#B45309' }}>
                                अरे मोरे मईया,<br />ई का हुई गवा??
                            </span>
                            <span className="thought-sub" style={{ marginTop: '0.4rem', color: '#78350F' }}>
                                (Oh mother, what happened??)
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT — CONTENT */}
                <div className="content-panel">
                    {/* Quote type badge */}
                    <div className="error-eyebrow" style={{ color: '#EA580C' }}>
                        ॥ {mounted ? current.type : QUOTES[0].type} ॥
                    </div>

                    {/* BIG 404 — solid orange, always visible on light bg */}
                    <div style={{
                        fontFamily: 'var(--font-ancient, serif)',
                        fontWeight: 900,
                        fontSize: 'clamp(5.5rem, 11vw, 9.5rem)',
                        lineHeight: 0.95,
                        letterSpacing: '-0.04em',
                        color: '#EA580C',
                        textShadow: '2px 4px 20px rgba(234,88,12,0.2)',
                        marginBottom: '0.3rem',
                    }}>
                        404
                    </div>

                    {/* Subtitle / title */}
                    <div className="error-title" style={{ color: '#1E293B', opacity: 0.85 }}>
                        {mounted ? current.title : QUOTES[0].title}
                    </div>

                    {/* Body text */}
                    <p className="gs-404-body" style={{
                        color: '#475569',
                        opacity: mounted ? 1 : 0,
                        transition: 'opacity 0.5s',
                    }}>
                        {mounted ? current.body : QUOTES[0].body}
                    </p>

                    {/* Vedic equation box */}
                    <div className="gs-404-equation-box" style={{
                        background: '#FFF7ED',
                        border: '1px solid #FED7AA',
                        opacity: mounted ? 1 : 0,
                        transition: 'opacity 0.5s 0.1s',
                    }}>
                        <div className="gs-404-eq-label" style={{ color: '#EA580C', background: '#FFF7ED' }}>
                            {mounted ? current.equation.label : QUOTES[0].equation.label}
                        </div>
                        <div className="gs-404-eq" style={{ fontSize: '1.5rem' }}>
                            <span style={{ color: '#1E293B' }}>{mounted ? current.equation.part1 : QUOTES[0].equation.part1}</span>
                            <span style={{ color: '#94A3B8' }}>{mounted ? current.equation.op1 : QUOTES[0].equation.op1}</span>
                            <span style={{ color: '#1E293B' }}>{mounted ? current.equation.part2 : QUOTES[0].equation.part2}</span>
                            <span style={{ color: '#94A3B8' }}>{mounted ? current.equation.op2 : QUOTES[0].equation.op2}</span>
                            <span style={{ color: '#EA580C', fontWeight: 700 }}>{mounted ? current.equation.result : QUOTES[0].equation.result}</span>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="actions" style={{
                        opacity: mounted ? 1 : 0,
                        transition: 'opacity 0.5s 0.2s',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                    }}>
                        <Link href="/" className="btn" style={{ background: '#EA580C', color: '#fff', border: 'none', fontWeight: 600 }}>
                            🏠 मुख्यपृष्ठ (Home)
                        </Link>
                        <Link href="/solver" className="btn" style={{ border: '1px solid #CBD5E1', color: '#1E293B', background: 'transparent' }}>
                            🧮 Solver वापरा
                        </Link>
                        {mounted && (
                            <button
                                onClick={nextQuote}
                                className="btn"
                                style={{
                                    border: '1px solid #FED7AA',
                                    color: '#EA580C',
                                    background: '#FFF7ED',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                🎲 अगला संदेश (Next Quote)
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Sanskrit background glyphs */}
            <div className="gs-404-bg-elements" aria-hidden="true">
                <span className="gs-404-float gs-404-float-1" style={{ color: '#EA580C', opacity: 0.08 }}>४</span>
                <span className="gs-404-float gs-404-float-2" style={{ color: '#B45309', opacity: 0.07 }}>०</span>
                <span className="gs-404-float gs-404-float-3" style={{ color: '#EA580C', opacity: 0.08 }}>४</span>
                <span className="gs-404-float gs-404-float-4" style={{ color: '#D97706', opacity: 0.06 }}>Ø</span>
                <span className="gs-404-float gs-404-float-5" style={{ color: '#B45309', opacity: 0.06 }}>∞</span>
            </div>
        </main>
    );
}
