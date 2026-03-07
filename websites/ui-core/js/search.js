/*
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: Global search frontend — autocomplete bar, results page logic,
 *          and click tracking. Works on every page.
 */

(function () {
    'use strict';

    const API = '/api/search';

    // ─── SEARCH BAR (NAV AUTOCOMPLETE) ─────────────────────────────────────

    window.GanitSearch = {

        /**
         * Init the nav search bar. Called by ganit-ui.js after injection.
         */
        initBar() {
            const input = document.getElementById('gsSearchInput');
            const dropdown = document.getElementById('gsSearchDropdown');
            if (!input || !dropdown) return;

            let debounceTimer = null;

            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                const q = input.value.trim();
                if (q.length < 2) { hideDropdown(); return; }
                debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const q = input.value.trim();
                    if (q) navigateToSearch(q);
                }
                if (e.key === 'Escape') { hideDropdown(); input.blur(); }
            });

            document.addEventListener('click', (e) => {
                const bar = document.getElementById('gsSearchBar');
                if (bar && !bar.contains(e.target)) hideDropdown();
            });
        },

        /**
         * Init the full results page (portal/search.html).
         */
        initResultsPage() {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q') || '';
            const type = params.get('type') || '';

            const searchInput = document.getElementById('gs-search-input');
            if (searchInput) searchInput.value = q;

            loadSidebar();

            if (q) {
                runSearch(q, type);
                setActiveFilter(type);
            } else {
                showEmptyState('');
            }

            // Filter buttons
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.dataset.filter;
                    setActiveFilter(filter);
                    runSearch(q || searchInput.value, filter);
                });
            });

            // Search input on results page
            if (searchInput) {
                let debounce;
                searchInput.addEventListener('input', () => {
                    clearTimeout(debounce);
                    debounce = setTimeout(() => {
                        const newQ = searchInput.value.trim();
                        history.replaceState({}, '', `?q=${encodeURIComponent(newQ)}`);
                        if (newQ) runSearch(newQ, getCurrentFilter());
                        else showEmptyState('');
                    }, 400);
                });
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        clearTimeout(debounce);
                        runSearch(searchInput.value.trim(), getCurrentFilter());
                    }
                });
            }
        }
    };

    // ─── NAV AUTOCOMPLETE HELPERS ───────────────────────────────────────────

    async function fetchSuggestions(q) {
        try {
            const res = await fetch(`${API}/suggest?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            renderSuggestions(data.suggestions || [], q);
        } catch { hideDropdown(); }
    }

    function renderSuggestions(suggestions, q) {
        const dropdown = document.getElementById('gsSearchDropdown');
        if (!dropdown) return;

        if (suggestions.length === 0) {
            dropdown.innerHTML = `<div class="gs-search-suggestion" onclick="GanitSearch._navigate('${encodeURIComponent(q)}')">
                <span class="gs-search-type-badge">search</span>
                <span>${escapeHtml(q)}</span>
            </div>`;
        } else {
            dropdown.innerHTML = suggestions.map(s => `
                <div class="gs-search-suggestion" onclick="GanitSearch._clickResult('${escapeHtml(q)}', '${s.slug || ''}', '${s.url || ''}')">
                    <span class="gs-search-type-badge">${s.doc_type || 'doc'}</span>
                    <span>${escapeHtml(s.title)}</span>
                </div>
            `).join('');
            // "See all results" footer
            dropdown.innerHTML += `<div class="gs-search-see-all" onclick="GanitSearch._navigate('${encodeURIComponent(q)}')">See all results for "${escapeHtml(q)}" →</div>`;
        }
        dropdown.classList.remove('hidden');
    }

    window.GanitSearch._navigate = function (encodedQ) {
        window.location.href = `/portal/search.html?q=${encodedQ}`;
    };

    window.GanitSearch._clickResult = function (query, docId, url) {
        logClick(query, docId);
        if (url) window.location.href = url;
        else window.location.href = `/portal/search.html?q=${encodeURIComponent(query)}`;
    };

    function hideDropdown() {
        const d = document.getElementById('gsSearchDropdown');
        if (d) d.classList.add('hidden');
    }

    function navigateToSearch(q) {
        window.location.href = `/portal/search.html?q=${encodeURIComponent(q)}`;
    }

    // ─── RESULTS PAGE HELPERS ───────────────────────────────────────────────

    async function runSearch(q, type) {
        const container = document.getElementById('gs-results-container');
        const countEl = document.getElementById('gs-results-count');
        if (!container) return;

        container.innerHTML = `<div class="gs-search-loading">Searching…</div>`;

        try {
            const params = new URLSearchParams({ q, limit: 20 });
            if (type) params.set('type', type);
            const res = await fetch(`${API}?${params}`);
            const data = await res.json();

            const results = data.results || [];
            if (countEl) countEl.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`;

            if (results.length === 0) {
                showEmptyState(q);
                return;
            }

            container.innerHTML = results.map(r => renderResultCard(r, q)).join('');

            // Log click on result click
            container.querySelectorAll('[data-result-click]').forEach(el => {
                el.addEventListener('click', () => {
                    logClick(q, el.dataset.resultClick);
                });
            });

        } catch (e) {
            container.innerHTML = `<p class="gs-search-error">Search failed. Please try again.</p>`;
        }
    }

    function renderResultCard(r, q) {
        const typeColors = {
            discovery: '#ff5500', lesson: '#0ea5e9', sutra: '#7c3aed',
            concept: '#ffb300', operation: '#22c55e', announcement: '#6b7280'
        };
        const color = typeColors[r.doc_type] || '#6b7280';

        const actions = {
            operation: `<a href="/solver/index.html?op=${r.slug || ''}" class="gs-result-action">Try in Solver →</a>`,
            discovery: `<a href="/discoveries/index.html#${r.slug || ''}" class="gs-result-action">Read More →</a>`,
            lesson: `<a href="/learning/index.html" class="gs-result-action">Start Learning →</a>`
        };
        const actionBtn = actions[r.doc_type] || `<a href="/portal/search.html?q=${encodeURIComponent(q)}" class="gs-result-action">Explore →</a>`;

        return `
        <div class="gs-result-card" data-result-click="${r.doc_id}">
            <div class="gs-result-meta">
                <span class="gs-result-type" style="border-color:${color};color:${color}">${r.doc_type}</span>
                ${r.category ? `<span class="gs-result-category">${r.category}</span>` : ''}
            </div>
            <h3 class="gs-result-title">${escapeHtml(r.title)}</h3>
            <p class="gs-result-excerpt">${r.excerpt || escapeHtml((r.body || '').slice(0, 120) + '…')}</p>
            ${actionBtn}
        </div>`;
    }

    function showEmptyState(q) {
        const container = document.getElementById('gs-results-container');
        if (!container) return;
        const countEl = document.getElementById('gs-results-count');
        if (countEl) countEl.textContent = q ? `No results for "${q}"` : '';
        container.innerHTML = `
            <div class="gs-search-empty">
                <div class="gs-search-empty-icon">🔍</div>
                ${q ? `<p>No results for <strong>"${escapeHtml(q)}"</strong></p>` : '<p>Enter a search term above.</p>'}
                <p class="gs-search-empty-hint">Try: digital root, nikhilam, Vedic…</p>
            </div>`;
    }

    async function loadSidebar() {
        try {
            const [popRes, trendRes] = await Promise.all([
                fetch(`${API}/popular`),
                fetch(`${API}/trending`)
            ]);
            const popData = await popRes.json();
            const trendData = await trendRes.json();

            const popularEl = document.getElementById('gs-popular-list');
            if (popularEl && popData.popular) {
                popularEl.innerHTML = popData.popular.slice(0, 8).map(p =>
                    `<a href="/portal/search.html?q=${encodeURIComponent(p.query)}" class="gs-sidebar-tag">${escapeHtml(p.query)}</a>`
                ).join('');
            }

            const trendEl = document.getElementById('gs-trending-list');
            if (trendEl && trendData.trending) {
                const trending = trendData.trending.slice(0, 6);
                if (trending.length === 0) {
                    trendEl.innerHTML = `<span class="gs-sidebar-tag">digital root</span><span class="gs-sidebar-tag">nikhilam</span>`;
                } else {
                    trendEl.innerHTML = trending.map(t =>
                        `<a href="/portal/search.html?q=${encodeURIComponent(t.query)}" class="gs-sidebar-tag">${escapeHtml(t.query)}</a>`
                    ).join('');
                }
            }
        } catch { /* silent */ }
    }

    function getCurrentFilter() {
        const active = document.querySelector('[data-filter].active');
        return active ? active.dataset.filter : '';
    }

    function setActiveFilter(type) {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === type);
        });
    }

    function logClick(query, docId) {
        fetch(`${API}/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, doc_id: docId })
        }).catch(() => { });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

})();
