"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';

interface SearchResult {
    doc_type: string;
    doc_id: string;
    title: string;
    excerpt: string;
    category?: string;
    slug?: string;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useI18n();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [filter, setFilter] = useState(searchParams.get('type') || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [popular, setPopular] = useState<string[]>([]);
    const [trending, setTrending] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/search/popular').then(r => r.json()).then(data => setPopular(data.popular?.map((p: any) => p.query) || []));
        fetch('/api/search/trending').then(r => r.json()).then(data => setTrending(data.trending?.map((t: any) => t.query) || []));
    }, []);

    useEffect(() => {
        const q = searchParams.get('q');
        const type = searchParams.get('type') || '';
        if (q) {
            setQuery(q);
            setFilter(type);
            performSearch(q, type);
        }
    }, [searchParams]);

    const performSearch = async (q: string, type: string) => {
        setLoading(true);
        try {
            const url = new URL('/api/search', window.location.origin);
            url.searchParams.set('q', q);
            if (type) url.searchParams.set('type', type);
            const res = await fetch(url.toString());
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchInput = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filter) params.set('type', filter);
        router.push(`?${params.toString()}`);
    };

    const handleFilterChange = (newType: string) => {
        setFilter(newType);
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (newType) params.set('type', newType);
        router.push(`?${params.toString()}`);
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            discovery: '#ff5500',
            concept: '#ffb300',
            node: '#0ea5e9'
        };
        return colors[type] || 'var(--fg-muted)';
    };

    return (
        <main className="gs-search-page">
            <div className="gs-search-results-column">
                <form onSubmit={handleSearchInput} className="gs-search-hero">
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Search GanitSūtram</h1>
                    <input 
                        type="text" 
                        className="gs-search-hero-input" 
                        placeholder="Search discoveries, concepts, sutras..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>

                <div className="gs-filter-bar">
                    {['', 'discovery', 'concept', 'node'].map(type => (
                        <button 
                            key={type}
                            className={`gs-filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => handleFilterChange(type)}
                        >
                            {type === '' ? 'All' : type === 'discovery' ? 'Discoveries' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                        </button>
                    ))}
                </div>

                <div className="gs-results-container">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--fg-muted)' }}>Searching for ancient wisdom...</div>
                    ) : results.length > 0 ? (
                        results.map(r => (
                            <div key={`${r.doc_type}-${r.doc_id}`} className="gs-result-card">
                                <span className="gs-result-type" style={{ borderColor: getTypeColor(r.doc_type), color: getTypeColor(r.doc_type) }}>{r.doc_type}</span>
                                {r.category && <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--fg-muted)' }}>{r.category}</span>}
                                <h3 className="gs-result-title">{r.title}</h3>
                                <p className="gs-result-excerpt">{r.excerpt}</p>
                                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Explore →</div>
                            </div>
                        ))
                    ) : query && (
                        <div className="gs-search-empty">
                            <div className="gs-search-empty-icon">🔍</div>
                            <p>No results found for "{query}"</p>
                            <p className="gs-search-empty-hint">Try adjusting your filters or searching for terms like "nikhilam" or "digital root".</p>
                        </div>
                    )}
                    {!query && (
                        <div className="gs-search-empty">
                            <div className="gs-search-empty-icon">✨</div>
                            <p>Discover the secrets of numbers.</p>
                            <p className="gs-search-empty-hint">Type a keyword above to begin your discovery.</p>
                        </div>
                    )}
                </div>
            </div>

            <aside className="gs-search-sidebar">
                <div className="gs-sidebar-heading">Popular Searches</div>
                <div className="gs-sidebar-tags" style={{ marginBottom: '2.5rem' }}>
                    {popular.map(p => (
                        <button key={p} className="gs-sidebar-tag" onClick={() => { setQuery(p); performSearch(p, filter); }}>{p}</button>
                    ))}
                </div>

                <div className="gs-sidebar-heading">Trending Now</div>
                <div className="gs-sidebar-tags">
                    {trending.map(t => (
                        <button key={t} className="gs-sidebar-tag" onClick={() => { setQuery(t); performSearch(t, filter); }}>{t}</button>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(255,85,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,85,0,0.2)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Knowledge Map</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '1rem' }}>Visualize the cosmic connections between mathematical concepts.</p>
                    <a href="/portal/knowledge-map" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>View Graph map →</a>
                </div>
            </aside>
        </main>
    );
}
