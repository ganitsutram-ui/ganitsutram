/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';

interface ContentItem {
    content_id: string;
    content_type: string;
    title_en: string;
    slug: string;
    published: boolean;
    featured: boolean;
    category: string;
    updated_at: string;
    title_hi?: string;
    title_sa?: string;
}

export default function CMS() {
    const { t } = useI18n();
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [activeTab, setActiveTab] = useState<'en' | 'hi' | 'sa'>('en');

    useEffect(() => {
        // Mock data fetch
        setTimeout(() => {
            setContent([
                { content_id: '1', content_type: 'discovery', title_en: 'Digital Root Pattern', slug: 'digital-root', published: true, featured: true, category: 'Patterns', updated_at: new Date().toISOString() },
                { content_id: '2', content_type: 'sutra', title_en: 'Nikhilam Navatashcaramam Dashatah', slug: 'nikhilam', published: true, featured: false, category: 'Sutras', updated_at: new Date().toISOString() },
                { content_id: '3', content_type: 'concept', title_en: 'The Science of Nine', slug: 'science-of-nine', published: false, featured: false, category: 'Numbers', updated_at: new Date().toISOString() },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredContent = filter === 'all' ? content : content.filter(i => i.content_type === filter);

    const openEditor = (item: ContentItem | null = null) => {
        setEditingItem(item);
        setShowEditor(true);
    };

    const closeEditor = () => {
        setShowEditor(false);
        setEditingItem(null);
    };

    return (
        <main id="main-content" className="gs-admin-body">
            {/* Topbar */}
            <header className="cms-topbar">
                <div className="cms-topbar-inner">
                    <div className="cms-brand">
                        <div className="gs-nav-logo">
                            <span className="gs-nav-logo-dev">गणित</span>GanitSūtram
                        </div>
                        <span style={{ fontSize: '0.7rem', background: 'var(--accent-primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{t('cms.title')}</span>
                    </div>
                    <div className="cms-top-actions">
                        <button className="gs-btn gs-btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>{t('cms.syncBtn')}</button>
                        <div className="cms-user-pill">{t('cms.userAdmin')}</div>
                    </div>
                </div>
            </header>

            <div className="cms-layout">
                {/* Sidebar */}
                <aside className="cms-sidebar">
                    <div className="cms-sidebar-section">
                        <label className="cms-label">{t('cms.labelType')}</label>
                        <nav className="cms-filter-nav">
                            {['all', 'discovery', 'lesson', 'sutra', 'concept'].map(type => (
                                <button 
                                    key={type}
                                    className={`cms-filter-btn ${filter === type ? 'active' : ''}`}
                                    onClick={() => setFilter(type)}
                                >
                                    {type === 'all' ? t('cms.filterAll') : 
                                     type === 'discovery' ? t('cms.filterDiscovery') :
                                     type === 'lesson' ? t('cms.filterLesson') :
                                     type === 'sutra' ? t('cms.filterSutra') :
                                     t('cms.filterConcept')}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <button className="gs-btn gs-btn-primary" style={{ width: '100%' }} onClick={() => openEditor()}>{t('cms.newBtn')}</button>
                </aside>

                {/* Main Content */}
                <section className="cms-main-content">
                    {loading ? (
                        <div className="cms-placeholder">
                            <div className="gs-loader"></div>
                            <p>{t('cms.loading')}</p>
                        </div>
                    ) : (
                        <div className="cms-table-wrapper">
                            <table className="gs-table">
                                <thead>
                                    <tr>
                                        <th>{t('cms.thType')}</th>
                                        <th>{t('cms.thTitle')}</th>
                                        <th>{t('cms.thStatus')}</th>
                                        <th>{t('cms.thCategory')}</th>
                                        <th>{t('cms.thUpdated')}</th>
                                        <th style={{ textAlign: 'right' }}>{t('cms.thActions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContent.map(item => (
                                        <tr key={item.content_id}>
                                            <td><span className="gs-badge gs-badge-sm">{item.content_type}</span></td>
                                            <td><strong>{item.title_en}</strong><br/><small style={{ color: 'var(--fg-muted)' }}>{item.slug}</small></td>
                                            <td>
                                                <span className={`cms-pill ${item.published ? 'cms-pill-published' : 'cms-pill-draft'}`}>
                                                    {item.published ? t('cms.statusPublished') : t('cms.statusDraft')}
                                                </span>
                                            </td>
                                            <td>{item.category}</td>
                                            <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="gs-btn gs-btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => openEditor(item)}>{t('cms.editBtn')}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <div className="cms-modal-overlay">
                    <div className="cms-editor-panel">
                        <header className="cms-editor-header">
                            <h2>{editingItem ? t('cms.editHeading') : t('cms.newHeading')}</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="gs-btn gs-btn-secondary" onClick={closeEditor}>{t('cms.cancelBtn')}</button>
                                <button className="gs-btn gs-btn-primary">{t('cms.saveBtn')}</button>
                            </div>
                        </header>
                        <div className="cms-editor-body">
                            <div className="cms-form-grid">
                                <aside className="cms-editor-meta">
                                    <div className="cms-field">
                                        <label>{t('cms.labelSlug')}</label>
                                        <input type="text" className="cms-input" defaultValue={editingItem?.slug} />
                                    </div>
                                    <div className="cms-field">
                                        <label>{t('cms.labelIcon')}</label>
                                        <input type="text" className="cms-input" placeholder="🌟" />
                                    </div>
                                    <div className="cms-field">
                                        <label>{t('cms.labelCategory')}</label>
                                        <input type="text" className="cms-input" defaultValue={editingItem?.category} />
                                    </div>
                                </aside>
                                <div className="cms-editor-main">
                                    <div className="cms-tabs">
                                        {(['en', 'hi', 'sa'] as const).map(lang => (
                                            <button 
                                                key={lang}
                                                className={`cms-tab-btn ${activeTab === lang ? 'active' : ''}`}
                                                onClick={() => setActiveTab(lang)}
                                            >
                                                {lang === 'en' ? t('nav.home') === 'Home' ? 'English' : 'English' : lang === 'hi' ? 'हिन्दी' : 'संस्कृतम्'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="cms-tab-content">
                                        <div className="cms-field">
                                            <label>{t('cms.labelTitle')} ({activeTab.toUpperCase()})</label>
                                            <input type="text" className={`cms-input ${activeTab !== 'en' ? 'font-hi' : ''}`} defaultValue={activeTab === 'en' ? editingItem?.title_en : ''} />
                                        </div>
                                        <div className="cms-field">
                                            <label>{t('cms.labelBody')}</label>
                                            <div className="cms-md-container">
                                                <div className="cms-md-toolbar">
                                                    <button>B</button>
                                                    <button>I</button>
                                                    <button>H2</button>
                                                    <button>Code</button>
                                                </div>
                                                <div className="cms-md-split">
                                                    <textarea className={`cms-textarea-lg ${activeTab !== 'en' ? 'font-hi' : ''}`} placeholder={t('cms.placeholderBody')} />
                                                    <div className={`cms-preview-panel gs-markdown ${activeTab !== 'en' ? 'font-hi' : ''}`}>
                                                        <p>{t('cms.previewPlaceholder')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
