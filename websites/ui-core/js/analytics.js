/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Fetching, polling, and rendering the CSS-only analytics dashboard.
 */

(function () {
    'use strict';

    const { API_BASE } = window.GanitConfig;

    let realtimeInterval = null;

    async function fetchWithAuth(endpoint) {
        if (!window.GanitAuth || !window.GanitAuth.isLoggedIn()) {
            throw new Error("Unauthorized");
        }
        const token = window.GanitAuth.getToken();
        const resp = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) {
            if (resp.status === 403) throw new Error("Forbidden");
            throw new Error(`Fetch failed: ${resp.status}`);
        }
        return resp.json();
    }

    // --- CHART RENDERING (CSS ONLY) ---

    function renderBarChart(data, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<div style="color:var(--color-fg-muted); width:100%; text-align:center;">No data available</div>';
            return;
        }

        const { labelKey = 'label', valueKey = 'value', maxBars = 30 } = options;

        // Take last N elements
        let plotData = data.slice(-maxBars);

        const maxVal = Math.max(...plotData.map(d => d[valueKey]), 1);

        const html = plotData.map(item => {
            const val = item[valueKey] || 0;
            const pct = (val / maxVal) * 100;
            const lbl = item[labelKey];

            // For dates, extract Day
            const shortLbl = String(lbl).includes('-') ? lbl.split('-').slice(1).join('/') : lbl;

            return `
                <div class="bar-wrap">
                    <div class="bar" style="height: ${pct}%">
                        <div class="bar-tooltip">${lbl}: ${window.GanitI18n.formatResult(val)}</div>
                    </div>
                    <div class="bar-label">${shortLbl}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    function renderSummaryRow(summary) {
        const container = document.getElementById('summaryGrid');
        if (!container) return;

        const metrics = [
            { label: 'Total Users', value: summary.totalUsers },
            { label: 'Avg DAU (30d)', value: summary.avgDailyActive },
            { label: 'Total Solves', value: summary.totalSolves },
            { label: 'Practice Attempts', value: summary.totalPracticeAttempts },
            { label: 'Discovery Views', value: summary.totalDiscoveryViews },
            { label: 'Page Views', value: summary.totalPageViews }
        ];

        container.innerHTML = metrics.map(m => `
            <div class="summary-card">
                <div class="summary-val">${window.GanitI18n.formatResult(m.value)}</div>
                <div class="summary-lbl">${m.label}</div>
            </div>
        `).join('');
    }

    function renderTopOperations(operations) {
        const tbody = document.getElementById('topOpsTable');
        if (!tbody) return;

        if (operations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No solve data</td></tr>';
            return;
        }

        tbody.innerHTML = operations.map((op, i) => `
            <tr>
                <td>#${window.GanitI18n.formatResult(i + 1)}</td>
                <td style="font-weight:700; text-transform:capitalize;">${op.operation.replace(/-/g, ' ')}</td>
                <td>${window.GanitI18n.formatResult(op.count)}</td>
                <td style="width:40%;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="min-width:35px;font-size:0.8rem;">${window.GanitI18n.formatResult(op.percentage)}%</span>
                        <div class="vol-bar-outer">
                            <div class="vol-bar-inner" style="width:${op.percentage}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderEventBreakdown(events) {
        const tbody = document.getElementById('eventsTable');
        if (!tbody) return;

        tbody.innerHTML = events.map(ev => `
            <tr>
                <td style="font-family:var(--font-mono); font-size:0.85rem;">${ev.eventType}</td>
                <td style="font-weight:700;">${window.GanitI18n.formatResult(ev.count)}</td>
            </tr>
        `).join('');
    }

    function renderAccuracyGauge(accuracy) {
        const pan = document.getElementById('accuracyGauge');
        if (!pan) return;

        pan.innerHTML = `
            <div class="acc-big">${window.GanitI18n.formatResult(accuracy.accuracy)}%</div>
            <div class="acc-sub">${window.GanitI18n.formatResult(accuracy.totalCorrect)} / ${window.GanitI18n.formatResult(accuracy.totalAttempts)} Correct</div>
        `;
    }

    // --- DATA FETCHING ---

    async function fetchDashboard(days) {
        try {
            const data = await fetchWithAuth(`/analytics/dashboard?days=${days}`);
            const d = data.dashboard;

            renderSummaryRow(d.summary);

            renderBarChart(d.dailyActiveUsers, 'dauChart', { labelKey: 'date', valueKey: 'dau' });
            renderBarChart(d.newUsersByDay, 'newUsersChart', { labelKey: 'date', valueKey: 'newUsers' });
            renderBarChart(d.solvesPerDay, 'solvesChart', { labelKey: 'date', valueKey: 'count' });

            // Hourly requires 24 fixed bins
            const full24 = Array.from({ length: 24 }, (_, i) => {
                const h = d.hourlyDistribution.find(x => x.hour === i);
                return { hourStr: i.toString().padStart(2, '0') + ':00', count: h ? h.count : 0 };
            });
            renderBarChart(full24, 'hourlyChart', { labelKey: 'hourStr', valueKey: 'count', maxBars: 24 });

            renderTopOperations(d.topOperations);
            renderEventBreakdown(d.eventBreakdown);
            renderAccuracyGauge(d.practiceAccuracy);

        } catch (err) {
            console.error("Dashboard failed", err);
            if (err.message === "Forbidden") {
                document.body.innerHTML = '<div style="padding:4rem; text-align:center;"><h1>403 Forbidden</h1><p>Admin clearance required.</p></div>';
            }
        }
    }

    async function fetchRealtime() {
        try {
            const data = await fetchWithAuth('/analytics/realtime');
            const rt = data.realtime;

            const grid = document.getElementById('realtimeStats');
            if (grid) {
                grid.innerHTML = `
                    <div class="rt-item">
                        <span class="rt-val">${window.GanitI18n.formatResult(rt.activeUsersLastHour)}</span>
                        <span class="rt-lbl">Active Users (1H)</span>
                    </div>
                    <div class="rt-item">
                        <span class="rt-val">${window.GanitI18n.formatResult(rt.solvesLastHour)}</span>
                        <span class="rt-lbl">Solves (1H)</span>
                    </div>
                    <div class="rt-item">
                        <span class="rt-val" style="text-transform:capitalize;">${rt.topOperationLastHour.replace(/-/g, ' ')}</span>
                        <span class="rt-lbl">Top Operation (1H)</span>
                    </div>
                    <div class="rt-item">
                        <span class="rt-val">${window.GanitI18n.formatResult(rt.eventsLastHour)}</span>
                        <span class="rt-lbl">Total Events (1H)</span>
                    </div>
                `;
            }
        } catch (err) {
            console.warn("Realtime fetch failed", err);
        }
    }

    // --- INITIALIZATION ---

    function init() {
        if (!window.GanitAuth || !window.GanitAuth.isLoggedIn()) {
            window.location.href = '../portal/index.html';
            return;
        }

        const user = window.GanitAuth.getUser();
        if (user.role !== 'admin') {
            document.body.innerHTML = '<div style="padding:4rem; text-align:center;"><h1>403 Forbidden</h1><p>Admin clearance required.</p></div>';
            document.body.style.display = 'block';
            return;
        }

        document.body.style.display = 'block'; // Unhide

        // Initial Load
        const days = document.getElementById('periodSelect').value;
        fetchDashboard(days);
        fetchRealtime();

        // Listeners
        document.getElementById('periodSelect').addEventListener('change', (e) => {
            fetchDashboard(e.target.value);
        });

        document.getElementById('btnRefresh').addEventListener('click', () => {
            fetchDashboard(document.getElementById('periodSelect').value);
            fetchRealtime();
        });

        const toggle = document.getElementById('realtimeToggle');

        const startRt = () => {
            realtimeInterval = setInterval(fetchRealtime, 30000); // 30s
            document.querySelector('.pulse-dot').style.animationPlayState = 'running';
        };
        const stopRt = () => {
            clearInterval(realtimeInterval);
            document.querySelector('.pulse-dot').style.animationPlayState = 'paused';
        };

        toggle.addEventListener('change', (e) => {
            if (e.target.checked) startRt();
            else stopRt();
        });

        // Start RT automatically
        if (toggle.checked) startRt();
    }

    // EXPOSE
    window.GanitAnalytics = { init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
