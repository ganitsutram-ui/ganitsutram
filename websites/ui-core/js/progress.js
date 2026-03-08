/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Progress Dashboard Logic.
 *          Handles fetching stats, entries, and rendering.
 */

(function () {
    const { API_BASE } = window.GanitConfig;

    const PROGRESS_BASE = `${API_BASE}/user-progress`;

    // --- API CALLS ---
    async function fetchProgress(options = {}) {
        const token = window.GanitAuth ? window.GanitAuth.getToken() : null;
        if (!token) return null;

        const { operation, limit = 20, offset = 0 } = options;
        let url = `${PROGRESS_BASE}?limit=${limit}&offset=${offset}`;
        if (operation) url += `&operation=${operation}`;

        try {
            const resp = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await resp.json();
        } catch (e) {
            console.error("Progress fetch error:", e);
            return null;
        }
    }

    async function fetchStats() {
        const token = window.GanitAuth ? window.GanitAuth.getToken() : null;
        if (!token) return null;

        try {
            const resp = await fetch(`${PROGRESS_BASE}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            return data.stats;
        } catch (e) {
            console.error("Stats fetch error:", e);
            return null;
        }
    }

    async function clearProgress() {
        if (!confirm("Are you sure you want to clear your entire mathematical history? This cannot be undone.")) return;

        const token = window.GanitAuth ? window.GanitAuth.getToken() : null;
        if (!token) return;

        try {
            await fetch(PROGRESS_BASE, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            window.location.reload();
        } catch (e) {
            console.error("Clear progress error:", e);
        }
    }

    // --- RENDERING ---
    function renderProgressTable(entries, container) {
        if (!entries || entries.length === 0) {
            container.innerHTML = `<div class="gs-table-empty">No results saved yet. Start solving!</div>`;
            return;
        }

        let html = `
            <table class="gs-table">
                <thead>
                    <tr>
                        <th>Operation</th>
                        <th>Input(s)</th>
                        <th>Result</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        entries.forEach(e => {
            const date = window.GanitI18n.formatDate(e.solvedAt);
            const inputStr = e.input !== null
                ? window.GanitI18n.formatResult(e.input)
                : `${window.GanitI18n.formatResult(e.inputA)}, ${window.GanitI18n.formatResult(e.inputB)}`;

            html += `
                <tr>
                    <td class="gs-table-op">${formatOpName(e.operation)}</td>
                    <td>${inputStr}</td>
                    <td>${window.GanitI18n.formatResult(e.result)}</td>
                    <td class="gs-table-date">${date}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    function renderStatsPanel(stats, container) {
        if (!stats) return;

        const streakIcon = stats.streak > 0 ? "🔥" : "💤";

        let breakdownHtml = '';
        if (stats.operationBreakdown) {
            const total = stats.totalSolved;
            for (const [op, count] of Object.entries(stats.operationBreakdown)) {
                const percent = Math.round((count / total) * 100);
                breakdownHtml += `
                    <div class="gs-chart-item">
                        <div class="gs-chart-label">
                            <span>${formatOpName(op)}</span>
                            <span>${window.GanitI18n.formatResult(count)}</span>
                        </div>
                        <div class="gs-chart-bar-wrap">
                            <div class="gs-chart-bar" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="gs-stat-hero">
                <div class="gs-stat-hero-val">${window.GanitI18n.formatResult(stats.totalSolved)}</div>
                <div class="gs-stat-hero-lbl">Total Solved</div>
            </div>
            
            <div class="gs-stat-row">
                <span class="gs-stat-label">Current Streak</span>
                <span class="gs-stat-value">${window.GanitI18n.formatResult(stats.streak)} Days ${streakIcon}</span>
            </div>
            <div class="gs-stat-row">
                <span class="gs-stat-label">Main Operation</span>
                <span class="gs-stat-value">${formatOpName(stats.mostUsedOperation) || 'N/A'}</span>
            </div>

            <div class="gs-breakdown">
                <div class="gs-breakdown-title">Operation Breakdown</div>
                ${breakdownHtml || '<div style="color:var(--text-dim);font-size:0.8rem;">Solve to see breakdown</div>'}
            </div>
        `;
    }

    function formatOpName(slug) {
        if (!slug) return "";
        return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // --- DASHBOARD CONTROLLER ---
    let currentOffset = 0;
    const LIMIT = 20;

    async function initDashboard() {
        const dashboard = document.getElementById('gs-progress-dashboard');
        const nudge = document.getElementById('gs-progress-nudge');

        if (!dashboard) return;

        if (window.GanitAuth && window.GanitAuth.isLoggedIn()) {
            dashboard.style.display = 'block';
            if (nudge) nudge.style.display = 'none';

            await refreshDashboard();
        } else {
            dashboard.style.display = 'none';
            if (nudge) nudge.style.display = 'block';
        }
    }

    async function refreshDashboard() {
        const stats = await fetchStats();
        const progress = await fetchProgress({ limit: LIMIT, offset: 0 });

        renderStatsPanel(stats, document.getElementById('gs-stats-container'));
        renderProgressTable(progress ? progress.entries : [], document.getElementById('gs-table-container'));

        // Pagination visibility
        const loadMoreBtn = document.getElementById('btnLoadMoreProgress');
        if (progress && progress.total > LIMIT) {
            loadMoreBtn.style.display = 'block';
        } else if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }

    async function loadMore() {
        currentOffset += LIMIT;
        const btn = document.getElementById('btnLoadMoreProgress');
        btn.disabled = true;
        btn.textContent = "Loading...";

        const data = await fetchProgress({ limit: LIMIT, offset: currentOffset });

        if (data && data.entries.length > 0) {
            const tableBody = document.querySelector('.gs-table tbody');
            data.entries.forEach(e => {
                const tr = document.createElement('tr');
                const date = window.GanitI18n.formatDate(e.solvedAt);
                const inputStr = e.input !== null
                    ? window.GanitI18n.formatResult(e.input)
                    : `${window.GanitI18n.formatResult(e.inputA)}, ${window.GanitI18n.formatResult(e.inputB)}`;

                tr.innerHTML = `
                    <td class="gs-table-op">${formatOpName(e.operation)}</td>
                    <td>${inputStr}</td>
                    <td>${window.GanitI18n.formatResult(e.result)}</td>
                    <td class="gs-table-date">${date}</td>
                `;
                tableBody.appendChild(tr);
            });

            if (currentOffset + LIMIT >= data.total) {
                btn.style.display = 'none';
            }
        }

        btn.disabled = false;
        btn.textContent = "Load More History";
    }

    // --- INITIALIZATION ---
    document.addEventListener('ganit:auth:login', () => initDashboard());
    document.addEventListener('ganit:auth:logout', () => initDashboard());

    window.GanitProgress = {
        init: initDashboard,
        loadMore,
        clear: clearProgress
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }
})();
