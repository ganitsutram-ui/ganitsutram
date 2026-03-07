/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: User Profile & Progress Dashboard logic.
 *          Handles data fetching, achievement calculations, and dynamic rendering.
 */

(function () {
    'use strict';

    const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://api.ganitsutram.com/api';

    let historyOffset = 0;
    const HISTORY_LIMIT = 20;

    // --- DATA FETCHING ---
    async function fetchWithAuth(endpoint) {
        if (!window.GanitAuth || !window.GanitAuth.isLoggedIn()) {
            throw new Error("Unauthorized");
        }
        const token = window.GanitAuth.getToken();
        const resp = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
        return resp.json();
    }

    // --- BADGE DEFINITIONS ---
    const BADGE_DEFS = [
        { id: "first-solve", icon: "⚡", title: "First Solve", desc: "Completed your first computation.", check: (s, p) => s.totalSolved >= 1 },
        { id: "ten-solves", icon: "🔟", title: "Ten Solves", desc: "Solved 10 mathematical operations.", check: (s, p) => s.totalSolved >= 10 },
        { id: "century", icon: "💯", title: "Century", desc: "Solved 100 operations. Remarkable.", check: (s, p) => s.totalSolved >= 100 },
        { id: "streak-3", icon: "🔥", title: "On Fire", desc: "3-day solving streak.", check: (s, p) => s.streak >= 3 },
        { id: "streak-7", icon: "🌟", title: "Week Warrior", desc: "7-day solving streak.", check: (s, p) => s.streak >= 7 },
        { id: "practice-10", icon: "🎯", title: "Sharp Mind", desc: "Completed 10 practice problems.", check: (s, p) => p.totalAttempts >= 10 },
        { id: "accuracy-80", icon: "🏆", title: "High Accuracy", desc: "80% or higher practice accuracy.", check: (s, p) => p.overallAccuracy >= 80 },
        { id: "vedic-master", icon: "🕉️", title: "Vedic Master", desc: "Used all 5 core Vedic operations.", check: (s, p) => (s.byOperation || []).length >= 5 },
        {
            id: "explorer", icon: "🗺️", title: "Explorer", desc: "Used Pattern Engine operations.", check: (s, p) => {
                const ops = (s.byOperation || []).map(o => o.operation);
                return ops.includes('kaprekar') || ops.includes('fibonacci');
            }
        }
    ];

    // --- RENDERING FUNCTIONS ---

    function renderHeader(user, stats, meData) {
        const container = document.getElementById('profileHeader');
        if (!container) return;

        const initial = user.email.charAt(0).toUpperCase();
        const createdAt = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const rankBadge = (meData && meData.rank && meData.rank.rankGlobal)
            ? `<span title="Global Rank" style="margin-left: 8px; color: var(--profile-accent); font-family: 'Space Grotesk', sans-serif;">🏆 #${meData.rank.rankGlobal}</span>`
            : '';

        container.innerHTML = `
            <div class="avatar-circle">${initial}</div>
            <div class="profile-info">
                <h1 class="profile-email">${user.email}</h1>
                <div class="profile-badges-inline">
                    <span class="role-badge role-${user.role}">${user.role}</span>
                    ${rankBadge}
                </div>
                <div class="member-since">Member since ${createdAt}</div>
            </div>
            <div class="profile-actions">
                <button class="btn-logout" onclick="window.GanitAuth.logout()">Logout</button>
            </div>
        `;
    }

    function renderBadges(stats, practiceStats) {
        const container = document.getElementById('badgesRow');
        if (!container) return;

        container.innerHTML = BADGE_DEFS.map(def => {
            const earned = def.check(stats, practiceStats);
            const statusText = earned ? "Earned!" : `Requirement: ${def.desc}`;
            return `
                <div class="badge-item ${earned ? 'earned' : ''}">
                    <div class="badge-lock">🔒</div>
                    <div class="badge-icon">${def.icon}</div>
                    <div class="badge-title">${def.title}</div>
                    <div class="badge-desc">${def.desc}</div>
                    <div class="badge-tooltip">${statusText}</div>
                </div>
            `;
        }).join('');
    }

    function renderStatsCards(stats, practiceStats) {
        const container = document.getElementById('statsGrid');
        if (!container) return;

        const favOp = (stats.byOperation || []).sort((a, b) => b.count - a.count)[0]?.operation || 'None';

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Solved</div>
                <div class="stat-value">${window.GanitI18n.formatResult(stats.totalSolved || 0)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Current Streak</div>
                <div class="stat-value">${window.GanitI18n.formatResult(stats.streak || 0)} days</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Practice Accuracy</div>
                <div class="stat-value">${window.GanitI18n.formatResult(practiceStats.overallAccuracy || 0)}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Favourite Operation</div>
                <div class="stat-value" style="font-size: 1rem; text-transform: capitalize;">${favOp.replace(/-/g, ' ')}</div>
            </div>
        `;
    }

    function getMasteryClass(count) {
        if (count >= 50) return 'master';
        if (count >= 20) return 'skilled';
        if (count >= 5) return 'learning';
        return 'beginner';
    }

    function getMasteryLabel(m) {
        return m.charAt(0).toUpperCase() + m.slice(1);
    }

    function renderMastery(stats, concepts) {
        const container = document.getElementById('masteryList');
        if (!container) return;

        const userOps = stats.byOperation || [];
        if (userOps.length === 0) {
            container.innerHTML = '<div class="history-empty">Solve problems to build mastery.</div>';
            return;
        }

        container.innerHTML = userOps.map(op => {
            const concept = (concepts.concepts || []).find(c => c.name === op.operation);
            const mClass = getMasteryClass(op.count);
            const mLabel = getMasteryLabel(mClass);
            const pct = mClass === 'master' ? 100 : mClass === 'skilled' ? 75 : mClass === 'learning' ? 50 : 25;

            return `
                <div class="mastery-row">
                    <div class="mastery-meta">
                        <div class="mastery-name">${op.operation.replace(/-/g, ' ').toUpperCase()}</div>
                        <div class="mastery-sutra">${concept ? concept.sutra : ''}</div>
                        <div style="font-size: 0.75rem;">${window.GanitI18n.formatResult(op.count)} solves</div>
                    </div>
                    <div class="mastery-bar-outer">
                        <div class="mastery-bar-inner mastery-${mClass}" style="width: ${pct}%"></div>
                        <div class="mastery-label" style="color:var(--mastery-${mClass})">${mLabel}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderPractice(practiceStats) {
        const container = document.getElementById('practicePanel');
        if (!container) return;

        const getPerfLabel = (acc) => {
            if (acc >= 90) return "Excellent 🏆";
            if (acc >= 70) return "Good 🎯";
            if (acc >= 50) return "Improving 📈";
            return "Needs Practice 💪";
        };

        const rows = (practiceStats.byOperation || []).map(op => `
            <div class="performance-row">
                <div style="font-weight:700;">${op.operation.replace(/-/g, ' ')}</div>
                <div style="font-size:0.8rem;">${window.GanitI18n.formatResult(op.correct)}/${window.GanitI18n.formatResult(op.attempts)}</div>
                <div class="perf-label-badge">${window.GanitI18n.formatResult(op.accuracy)}% &nbsp; ${getPerfLabel(op.accuracy)}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="practice-overview">
                <div class="accuracy-circle">
                    <div class="accuracy-val">${window.GanitI18n.formatResult(practiceStats.overallAccuracy)}%</div>
                    <div class="accuracy-label">Accuracy</div>
                </div>
                <div>
                    <div style="font-size:1.1rem; font-weight:700;">${window.GanitI18n.formatResult(practiceStats.totalCorrect)} / ${window.GanitI18n.formatResult(practiceStats.totalAttempts)}</div>
                    <div style="color:var(--profile-fg-dim); font-size:0.85rem;">Total Correct Answers</div>
                </div>
            </div>
            <div class="practice-details">
                ${rows || '<div class="history-empty">Start practicing in the Arena.</div>'}
            </div>
        `;
    }

    function renderHistory(entries, append = false) {
        const container = document.getElementById('historyTableBody');
        if (!container) return;

        const rows = entries.map(entry => {
            const histInput = entry.input !== null
                ? window.GanitI18n.formatResult(entry.input)
                : `${window.GanitI18n.formatResult(entry.inputA)}, ${window.GanitI18n.formatResult(entry.inputB)}`;
            return `
            <tr>
                <td class="history-op-cell">${entry.operation}</td>
                <td>${histInput}</td>
                <td class="history-result-cell">${window.GanitI18n.formatResult(entry.result)}</td>
                <td class="history-date-cell">${window.GanitI18n.formatDate(entry.solvedAt)}</td>
            </tr>
        `}).join('');

        if (append) {
            container.innerHTML += rows;
        } else {
            container.innerHTML = rows || '<tr><td colspan="4" class="history-empty">No solves yet. Visit the Solver &rarr;</td></tr>';
        }

        const loadMoreBtn = document.getElementById('btnLoadMore');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = entries.length < HISTORY_LIMIT ? 'none' : 'block';
        }
    }

    function renderSessions(sessions) {
        const container = document.getElementById('sessionsTableBody');
        if (!container) return;

        if (!sessions || sessions.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="history-empty">No active sessions found.</td></tr>';
            return;
        }

        const rows = sessions.map(s => {
            const isCurrent = s.deviceHint === navigator.userAgent && s.issuedAt > new Date(Date.now() - 60000).toISOString() ? " (Current)" : "";
            return `
            <tr>
                <td style="font-size: 0.85rem;" title="${s.deviceHint}">${s.deviceHint.substring(0, 40)}${s.deviceHint.length > 40 ? '...' : ''} <span style="color:var(--mastery-master); font-weight:bold;">${isCurrent}</span></td>
                <td>${s.ipHint}.*</td>
                <td class="history-date-cell">${window.GanitI18n.formatDate(s.issuedAt)}</td>
                <td>
                    <button class="btn-clear" style="padding: 4px 8px; font-size: 0.8rem; border-color: #ef4444; color: #ef4444;" onclick="window.GanitProfile.revokeSession('${s.sessionId}')">Revoke</button>
                </td>
            </tr>
        `}).join('');

        container.innerHTML = rows;
    }

    function renderLearningPath(user, stats, practiceStats) {
        const container = document.getElementById('learningPathList');
        if (!container) return;

        // Mock learning path based on common operations
        const modules = [
            { id: 'digital-root', title: 'The Magic of Beejank', icon: '🔢', level: 'Beginner' },
            { id: 'nikhilam', title: 'Nikhilam Multiplication', icon: '⚡', level: 'Intermediate' },
            { id: 'urdhva', title: 'Urdhva Tiryak', icon: '⚔️', level: 'Advanced' },
            { id: 'squares-ending-5', title: 'Instant Squares', icon: '🔲', level: 'Beginner' }
        ];

        container.innerHTML = modules.map(m => {
            const hasSolved = (stats.byOperation || []).some(o => o.operation === m.id);
            const practiceOp = (practiceStats.byOperation || []).find(o => o.operation === m.id);
            const isMastered = practiceOp && practiceOp.accuracy > 80;

            const status = isMastered ? '<span style="color:#22c55e;">Mastered 🏆</span>' : (hasSolved ? '<span style="color:#eab308;">Started ✓</span>' : 'Not started');

            return `
                <div class="learning-path-row">
                    <div class="module-icon">${m.icon}</div>
                    <div class="module-info">
                        <div class="module-title">${m.title}</div>
                        <div class="module-level">${m.level}</div>
                    </div>
                    <div class="module-status">${status}</div>
                </div>
            `;
        }).join('');
    }

    // --- ACTIONS ---

    async function loadMoreHistory() {
        historyOffset += HISTORY_LIMIT;
        try {
            const data = await fetchWithAuth(`/user-progress?limit=${HISTORY_LIMIT}&offset=${historyOffset}`);
            renderHistory(data.entries, true);
        } catch (err) {
            console.error("Load more failed", err);
        }
    }

    async function clearHistory() {
        if (!confirm("Are you sure you want to clear your solve history? This cannot be undone.")) return;
        try {
            const token = window.GanitAuth.getToken();
            const resp = await fetch(`${API_BASE}/user-progress`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                location.reload();
            }
        } catch (err) {
            alert("Failed to clear history.");
        }
    }

    async function loadSessions() {
        try {
            const data = await fetchWithAuth('/auth/sessions');
            renderSessions(data.sessions);
        } catch (err) {
            console.error("Failed to load sessions", err);
        }
    }

    async function revokeSession(sessionId) {
        if (!confirm("Are you sure you want to revoke this session? The device will be logged out immediately.")) return;
        try {
            const token = window.GanitAuth.getToken();
            const resp = await fetch(`${API_BASE}/auth/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                loadSessions();
            }
        } catch (err) {
            console.error("Failed to revoke session", err);
        }
    }

    async function revokeAllOtherSessions() {
        if (!confirm("Are you sure you want to revoke ALL sessions? You will need to log back in everywhere, including here.")) return;
        try {
            const token = window.GanitAuth.getToken();
            const resp = await fetch(`${API_BASE}/auth/sessions`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                window.GanitAuth.logout();
            }
        } catch (err) {
            console.error("Failed to revoke ALL sessions", err);
        }
    }

    // --- INITIALIZATION ---

    async function init() {
        if (!window.GanitAuth) return;

        // 1. Auth Check
        if (!window.GanitAuth.isLoggedIn()) {
            window.location.href = '../portal/index.html';
            return;
        }

        const user = window.GanitAuth.getUser();

        try {
            // 2. Parallel Fetch
            const [pStats, prStats, concepts, history, meData] = await Promise.all([
                fetchWithAuth('/user-progress/stats'),
                fetchWithAuth('/practice/stats'),
                fetchWithAuth('/concepts'),
                fetchWithAuth(`/user-progress?limit=${HISTORY_LIMIT}&offset=0`),
                fetchWithAuth('/leaderboard/me').catch(() => null)
            ]);

            // 3. Render Sections
            renderHeader(user, pStats.stats, meData);
            renderBadges(pStats.stats, prStats.stats);
            renderStatsCards(pStats.stats, prStats.stats);
            renderMastery(pStats.stats, concepts);
            renderPractice(prStats.stats);
            renderHistory(history.entries);
            renderLearningPath(user, pStats.stats, prStats.stats);

            loadSessions(); // Async non-blocking load of active sessions

            // 4. Attach Listeners
            const loadMoreBtn = document.getElementById('btnLoadMore');
            if (loadMoreBtn) loadMoreBtn.onclick = loadMoreHistory;

            const clearBtn = document.getElementById('btnClearHistory');
            if (clearBtn) clearBtn.onclick = clearHistory;

            const revokeAllBtn = document.getElementById('btnRevokeAllSessions');
            if (revokeAllBtn) revokeAllBtn.onclick = revokeAllOtherSessions;

        } catch (err) {
            console.error("Dashboard init failed", err);
            // Show error in UI
            document.body.innerHTML += `<div style="position:fixed; top:20px; right:20px; background:#ef4444; color:#fff; padding:1rem; border-radius:8px; z-index:9999;">Error loading dashboard. Please refresh.</div>`;
        }
    }

    // EXPOSE
    window.GanitProfile = { init, revokeSession, revokeAllOtherSessions };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
