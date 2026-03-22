/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';

export default function DiscoveriesPage() {
    const { t, formatNumber, locale } = useI18n();
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const [category, setCategory] = useState('all');
    const [selectedDiscovery, setSelectedDiscovery] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSolving, setIsSolving] = useState(false);
    const [solveResult, setSolveResult] = useState<any>(null);

    const API_BASE = '/api';

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'core', label: 'Core' },
        { id: 'vedic', label: 'Vedic' },
        { id: 'engine', label: 'Engine' },
        { id: 'foundation', label: 'Foundation' },
        { id: 'pattern', label: 'Pattern' },
        { id: 'sutra', label: 'Sutras' }
    ];

    useEffect(() => {
        fetchDiscoveries();
    }, [category, locale]);

    const fetchDiscoveries = async () => {
        setIsLoading(true);
        try {
            // Try CMS API first (as in legacy discoveries.js)
            const type = category === 'sutra' ? 'sutra' : 'discovery';
            let cmsUrl = `${API_BASE}/cms/content/${type}?locale=${locale}`;
            if (category !== 'all' && category !== 'sutra') cmsUrl += `&category=${category}`;

            let res = await fetch(cmsUrl);
            let data = await res.json();

            if (res.ok && (data.data || data.content)) {
                setDiscoveries(data.data || data.content);
            } else {
                // Fallback to discoveries API
                const url = category === 'all' ? `${API_BASE}/discoveries` : `${API_BASE}/discoveries?category=${category}`;
                res = await fetch(url);
                data = await res.json();
                if (res.ok) setDiscoveries(data.discoveries);
            }
        } catch (err) {
            console.error("Failed to fetch discoveries", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSolve = async (e: React.FormEvent) => {
        e.preventDefault();
        const op = (document.getElementById('solver-op') as HTMLSelectElement).value;
        const val = (document.getElementById('solver-input') as HTMLInputElement).value;

        setIsSolving(true);
        setSolveResult(null);

        try {
            const res = await fetch(`${API_BASE}/solve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation: op, input: val })
            });
            const data = await res.json();
            if (res.ok) setSolveResult(data);
        } catch (err) {
            console.error("Solve failed", err);
        } finally {
            setIsSolving(false);
        }
    };

    return (
        <main className="gs-container" style={{ padding: '120px 20px 60px' }}>
            
            {/* Hero Section */}
            <section className="gs-discoveries-hero">
                <div className="gs-sanskrit-line">यत्र गणितं तत्र सत्यम्</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', textAlign: 'center' }}>
                    Where there is Mathematics, there is Truth.
                </div>
                <h1 className="gs-hero-title">Mathematical Discoveries</h1>
                <p className="gs-hero-sub">Ancient patterns. Modern clarity.</p>
            </section>

            {/* Category Filter */}
            <section className="gs-filter-section">
                <div className="gs-filter-bar">
                    {categories.map(cat => (
                        <button 
                            key={cat.id} 
                            className={`gs-filter-btn ${category === cat.id ? 'active' : ''}`}
                            onClick={() => setCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Discovery Grid */}
            <section className="gs-section" style={{ minHeight: '400px' }}>
                <div className="gs-section-label">Archive of Patterns</div>
                {isLoading ? (
                    <div className="gs-loading-text">Synchronizing mathematical patterns...</div>
                ) : (
                    <div className="gs-discovery-grid">
                        {discoveries.length === 0 && !isLoading && (
                            <div className="gs-loading-text">No discoveries found for this category.</div>
                        )}
                        {discoveries.map(d => (
                            <div key={d.slug || d.content_id} className="gs-discovery-card" onClick={() => setSelectedDiscovery(d)}>
                                <div className="gs-discovery-icon">{d.icon || '📐'}</div>
                                <h3>{d.title || d.title_en}</h3>
                                <p>{d.description || d.excerpt || d.excerpt_en || ''}</p>
                                <div className="gs-discovery-footer">
                                    <span className="gs-category-tag">{d.category}</span>
                                    <span className="gs-discovery-link">Explore →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Live Solver Widget */}
            <section className="gs-solver-widget">
                <div className="gs-section-label">Interactive Exploration</div>
                <h2 className="gs-section-title">Live Solver</h2>
                <p className="gs-hero-sub" style={{ marginBottom: '2.5rem' }}>Experience the power of Vedic algorithms in real-time.</p>

                <form className="gs-solver-form" onSubmit={handleSolve}>
                    <div className="gs-form-group">
                        <label>Input Number</label>
                        <input type="text" id="solver-input" className="gs-input" placeholder="e.g. 98" required />
                    </div>
                    <div className="gs-form-group">
                        <label>Algorithm</label>
                        <select id="solver-op" className="gs-select">
                            <option value="digital-root">Digital Root (Beejank)</option>
                            <option value="digital-root-steps">Digital Root with Steps</option>
                        </select>
                    </div>
                    <button type="submit" className="gs-button gs-button-primary" disabled={isSolving}>
                        {isSolving ? 'Computing...' : 'Compute'}
                    </button>
                </form>

                {solveResult && (
                    <div className="gs-solver-result" style={{ display: 'block' }}>
                        <div className="gs-section-label">Result</div>
                        <div className="gs-result-value">{formatNumber(solveResult.result)}</div>
                        {solveResult.steps && solveResult.steps.length > 1 && (
                            <div className="gs-steps-list">
                                {solveResult.steps.map((s: any, i: number) => (
                                    <React.Fragment key={i}>
                                        <div className="gs-step-item">{s}</div>
                                        {i < solveResult.steps.length - 1 && <span className="gs-step-arrow">→</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Detail Drawer (Modal) */}
            {selectedDiscovery && (
                <div className="gs-drawer open">
                    <div className="gs-drawer-overlay" onClick={() => setSelectedDiscovery(null)}></div>
                    <div className="gs-drawer-content">
                        <button className="gs-drawer-close" onClick={() => setSelectedDiscovery(null)}>&times;</button>
                        <div className="gs-drawer-body">
                            <div className="gs-drawer-header">
                                <div className="gs-drawer-icon">{selectedDiscovery.icon}</div>
                                <h2 className="gs-drawer-title">{selectedDiscovery.title}</h2>
                                <div className="gs-sutra-block">
                                    {(selectedDiscovery.sutra || selectedDiscovery.sutra_name) && (
                                        <div className="gs-sutra-name">{selectedDiscovery.sutra || selectedDiscovery.sutra_name}</div>
                                    )}
                                    {selectedDiscovery.sutra_meaning && (
                                        <div className="gs-sutra-meaning">{selectedDiscovery.sutra_meaning}</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="gs-drawer-section">
                                <div className="gs-long-desc" dangerouslySetInnerHTML={{ __html: selectedDiscovery.body || selectedDiscovery.body_en || selectedDiscovery.long_desc || selectedDiscovery.description || selectedDiscovery.excerpt || '' }}></div>
                            </div>

                            {selectedDiscovery.example_input && (
                                <div className="gs-drawer-section">
                                    <h4 className="gs-label">Example Pattern</h4>
                                    <div className="gs-example-pill">
                                        <span className="gs-ex-in">{selectedDiscovery.example_input}</span>
                                        <span className="gs-ex-arrow">→</span>
                                        <span className="gs-ex-out">{selectedDiscovery.example_output}</span>
                                    </div>
                                </div>
                            )}

                            <div className="gs-drawer-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <Link href={`/solver?op=${selectedDiscovery.slug}`} className="gs-button gs-button-primary">Try in Solver →</Link>
                                <button className="gs-button" onClick={() => setSelectedDiscovery(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
