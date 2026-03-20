/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Discoveries website interactive logic and API integration.
*/

(function () {
    'use strict';

    const { API_BASE: API_ROOT, SOLVER_URL } = window.GanitConfig;
    const API_BASE = `${API_ROOT}/discoveries`;
    const SOLVE_URL = `${API_ROOT}/solve`;

    // State
    let allDiscoveries = [];

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });

    async function init() {
        await fetchAndRenderDiscoveries();
        initFilters();
        initSolver();
        initDrawer();
    }

    /**
     * Fetches discoveries and renders them.
     */
    async function fetchAndRenderDiscoveries(category = 'all') {
        const grid = document.getElementById('discovery-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="gs-loading-text">Synchronizing mathematical patterns...</div>';

        try {
            // STEP 1: Try CMS API first
            const lang = localStorage.getItem('gs_locale') || 'en';
            let cmsUrl = `${API_ROOT}/cms/content?type=discovery&locale=${lang}`;
            if (category !== 'all') cmsUrl += `&category=${category}`;

            const cmsRes = await fetch(cmsUrl);
            if (cmsRes.ok) {
                const cmsData = await cmsRes.json();
                if (cmsData.content && cmsData.content.length > 0) {
                    allDiscoveries = cmsData.content;
                    renderDiscoveryGrid(allDiscoveries, grid);
                    return;
                }
            }

            // STEP 2: Fallback to existing discoveries API
            const url = category === 'all' ? API_BASE : `${API_BASE}?category=${category}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                allDiscoveries = data.discoveries;
                renderDiscoveryGrid(allDiscoveries, grid);
            } else {
                throw new Error(data.error || "Failed to fetch discoveries");
            }
        } catch (e) {
            console.error(e);
            grid.innerHTML = `<div class="gs-error-msg">Error: ${e.message}. Falling back to offline mode.</div>`;
        }
    }

    /**
     * Renders discovery cards.
     */
    function renderDiscoveryGrid(discoveries, container) {
        if (!discoveries.length) {
            container.innerHTML = '<div class="gs-empty-msg">No discoveries found in this category.</div>';
            return;
        }

        container.innerHTML = discoveries.map(d => `
            <div class="gs-discovery-card" data-slug="${d.slug}">
                <div class="gs-card-badge ${d.difficulty}">${d.difficulty}</div>
                <div class="gs-discovery-icon">${d.icon}</div>
                <h3>${d.title}</h3>
                <p>${d.description}</p>
                <div class="gs-discovery-footer">
                    <span class="gs-category-tag">${d.category}</span>
                    <span class="gs-discovery-link">Explore →</span>
                </div>
            </div>
        `).join('');

        // Add click listeners to cards
        container.querySelectorAll('.gs-discovery-card').forEach(card => {
            card.addEventListener('click', () => openDiscoveryDetail(card.dataset.slug));
        });
    }

    /**
     * Category filtering logic.
     */
    function initFilters() {
        const filterBar = document.getElementById('category-filter');
        if (!filterBar) return;

        filterBar.addEventListener('click', (e) => {
            if (e.target.classList.contains('gs-filter-btn')) {
                filterBar.querySelectorAll('.gs-filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                fetchAndRenderDiscoveries(e.target.dataset.category);
            }
        });
    }

    /**
     * Detail Drawer logic.
     */
    function initDrawer() {
        const drawer = document.getElementById('detail-drawer');
        const closeBtn = document.getElementById('drawer-close');
        const overlay = document.getElementById('drawer-overlay');

        if (!drawer) return;

        const close = () => drawer.classList.remove('open');
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);
    }

    async function openDiscoveryDetail(slug) {
        const drawer = document.getElementById('detail-drawer');
        const body = document.getElementById('drawer-body');

        drawer.classList.add('open');
        body.innerHTML = '<div class="gs-loading-text">Unveiling ancient logic...</div>';

        try {
            // Try CMS Slug API first
            const lang = localStorage.getItem('gs_locale') || 'en';
            const cmsRes = await fetch(`${API_ROOT}/cms/content/${slug}?locale=${lang}`);
            if (cmsRes.ok) {
                const cmsData = await cmsRes.json();
                renderDetailDrawer(cmsData.content, body);
                return;
            }

            // Fallback to existing
            const response = await fetch(`${API_BASE}/${slug}`);
            const data = await response.json();

            if (response.ok) {
                renderDetailDrawer(data.discovery, body);
            } else {
                throw new Error(data.error || "Failed to load detail");
            }
        } catch (e) {
            body.innerHTML = `<div class="gs-error-msg">Error: ${e.message}</div>`;
        }
    }

    function renderDetailDrawer(d, container) {
        container.innerHTML = `
            <div class="gs-drawer-header">
                <div class="gs-drawer-icon">${d.icon}</div>
                <h2 class="gs-drawer-title">${d.title}</h2>
                <div class="gs-sutra-block">
                    <div class="gs-sutra-name">${d.sutra || ''}</div>
                    <div class="gs-sutra-meaning">${d.sutra_meaning || ''}</div>
                </div>
            </div>
            
            <div class="gs-drawer-section">
                <div class="gs-long-desc gs-markdown">
                    ${window.GanitUI.renderMarkdown(d.body || d.long_desc || d.description)}
                </div>
            </div>

            ${d.example_input ? `
                <div class="gs-drawer-section">
                    <h4 class="gs-label">Example Pattern</h4>
                    <div class="gs-example-pill">
                        <span class="gs-ex-in">${d.example_input}</span>
                        <span class="gs-ex-arrow">→</span>
                        <span class="gs-ex-out">${d.example_output}</span>
                    </div>
                </div>
            ` : ''}

            ${d.patterns && d.patterns.length ? `
                <div class="gs-drawer-section">
                    <h4 class="gs-label">Core Observations</h4>
                    <div class="gs-patterns-list">
                        ${d.patterns.map(p => `
                            <div class="gs-pattern-item">
                                <strong>${p.pattern_label}</strong>
                                <p>${p.pattern_desc}</p>
                                ${p.example ? `<code class="gs-pattern-ex">${p.example}</code>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="gs-drawer-actions">
                ${d.category === 'pattern' && d.slug === 'fibonacci-digital-roots'
                ? `<a href="${window.GanitConfig.LAB_URL}" class="gs-button gs-button-primary">Try Fibonacci Explorer →</a>`
                : d.category === 'pattern' && d.slug === 'kaprekar-constant'
                    ? `<a href="${window.GanitConfig.LAB_URL}" class="gs-button gs-button-primary">Try Kaprekar Routine →</a>`
                    : `<a href="${SOLVER_URL}?op=${d.slug}" class="gs-button gs-button-primary">Try in Solver →</a>`
            }
                <a href="../learning/practice.html?operation=" class="gs-button">Practice This →</a>
            </div>
        `;
    }

    /**
     * Initializes the Live Solver Widget.
     */
    function initSolver() {
        const form = document.getElementById('gs-solver-form');
        const btn = document.getElementById('gs-solver-submit');
        const resultDiv = document.getElementById('gs-solver-result');
        const resultValue = document.getElementById('gs-result-value');
        const stepsList = document.getElementById('gs-steps-list');
        const errorMsg = document.getElementById('gs-error-msg');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const operation = document.getElementById('solver-op').value;
            const input = document.getElementById('solver-input').value;

            errorMsg.textContent = '';
            resultDiv.style.display = 'none';
            form.classList.add('gs-loading-state');
            btn.textContent = 'Computing...';

            try {
                const response = await fetch(SOLVE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ operation, input })
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error || 'Computation failed');

                resultValue.textContent = window.GanitI18n.formatResult(data.result);

                if (data.steps && data.steps.length > 1) {
                    stepsList.innerHTML = data.steps.map((s, i) => `
                        <div class="gs-step-item">${String(s).replace(/\d+/g, match => window.GanitI18n.formatResult(match))}</div>
                        ${i < data.steps.length - 1 ? '<span class="gs-step-arrow">→</span>' : ''}
                    `).join('');
                } else {
                    stepsList.innerHTML = '';
                }

                resultDiv.style.display = 'block';

            } catch (err) {
                errorMsg.textContent = `Error: ${err.message}`;
            } finally {
                form.classList.remove('gs-loading-state');
                btn.textContent = 'Compute';
            }
        });
    }

    // Assign to window for global access if needed
    window.GanitDiscoveries = {
        fetchDiscoveries,
        openDiscoveryDetail
    };

})();
