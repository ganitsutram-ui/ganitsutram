/*
 * GANITSUTRAM
 * User Profile & Progress Dashboard logic.
 */

(function () {
    'use strict';

    const { API_BASE } = window.GanitConfig;

    let historyOffset = 0;
    const HISTORY_LIMIT = 20;

    // --- DATA FETCHING ---
    async function fetchWithAuth(endpoint, options = {}) {
        if (!window.GanitAuth || !window.GanitAuth.isLoggedIn()) {
            throw new Error("Unauthorized");
        }
        const token = window.GanitAuth.getToken();
        const resp = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { 
                ...options.headers,
                'Authorization': `Bearer ${token}` 
            }
        });
        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
        return resp.json();
    }

    // --- BADGE DEFINITIONS (Visuals) ---
    const BADGE_VISUALS = {
        "first-solve": { icon: "⚡", title: "First Solve", desc: "Completed your first computation." },
        "ten-solves": { icon: "🔟", title: "Ten Solves", desc: "Solved 10 mathematical operations." },
        "century": { icon: "💯", title: "Century", desc: "Solved 100 operations. Remarkable." },
        "streak-3": { icon: "🔥", title: "On Fire", desc: "3-day solving streak." },
        "streak-7": { icon: "🌟", title: "Week Warrior", desc: "7-day solving streak." },
        "practice-10": { icon: "🎯", title: "Sharp Mind", desc: "Completed 10 practice problems." },
        "accuracy-80": { icon: "🏆", title: "High Accuracy", desc: "80% or higher practice accuracy." },
        "vedic-master": { icon: "🕉️", title: "Vedic Master", desc: "Used all 5 core Vedic operations." }
    };

    // --- AVATAR SELECTION ---
    const PREDEFINED_AVATARS = [
        { id: 'mayura', url: '../ui-core/assets/img/avatars/mayura.png', label: 'Mayura (Wisdom)' },
        { id: 'shiva', url: '../ui-core/assets/img/avatars/shiva.png', label: 'Shiva (Transformation)' },
        { id: 'mandala', url: '../ui-core/assets/img/avatars/mandala.png', label: 'Mandala (Pattern)' },
        { id: 'rishi', url: '../ui-core/assets/img/avatars/rishi.png', label: 'Rishi (Focus)' },
        { id: 'chakram', url: '../ui-core/assets/img/avatars/chakram.png', label: 'Chakram (Precision)' },
        { id: 'lotus', url: '../ui-core/assets/img/avatars/lotus.png', label: 'Lotus (Growth)' }
    ];

    // --- RENDERING FUNCTIONS ---

    function renderHeader(user, stats, meData) {
        const container = document.getElementById('profileHeader');
        if (!container) return;

        const displayName = user.displayName || user.email.split('@')[0];
        const avatarUrl = user.avatarUrl || '../ui-core/assets/img/icon-192.png';
        const createdAt = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const rankBadge = (meData && meData.rank && meData.rank.rankGlobal)
            ? `<span title="Global Rank" style="margin-left: 8px; color: var(--profile-accent); font-family: 'Space Grotesk', sans-serif;">🏆 #${meData.rank.rankGlobal}</span>`
            : '';

        container.innerHTML = `
            <div class="avatar-circle-wrapper" onclick="window.GanitProfile.openAvatarModal()" title="Change Avatar">
                <img src="${avatarUrl}" class="avatar-img" alt="Profile Avatar">
                <div class="avatar-edit-overlay">Edit</div>
            </div>
            <div class="profile-info">
                <h1 class="profile-email" id="profileDisplayName">${displayName}</h1>
                <div class="profile-badges-inline">
                    <span class="role-badge role-${user.role}">${user.role}</span>
                    ${rankBadge}
                </div>
                <div class="member-since">Member since ${createdAt}</div>
                <div class="profile-meta-btns">
                     <button class="gs-profile-mini-btn" onclick="window.GanitProfile.editDisplayName()" title="Edit Display Name">✎ Edit Name</button>
                     <button class="gs-profile-mini-btn" onclick="window.GanitProfile.copyProfileLink()" title="Copy Link">🔗 Copy Link</button>
                </div>
            </div>
            <div class="profile-actions">
                <button class="btn-logout" onclick="window.GanitAuth.logout()">Logout</button>
            </div>
        `;
    }

    function renderBadges(earnedBadges) {
        const container = document.getElementById('badgesRow');
        if (!container) return;

        const earnedIds = earnedBadges.map(b => b.badge_id);

        container.innerHTML = Object.entries(BADGE_VISUALS).map(([id, def]) => {
            const earned = earnedIds.includes(id);
            const statusText = earned ? "Earned!" : `Requirement: ${def.desc}`;
            const shareBtn = earned ? `<button class="badge-share-btn" onclick="window.GanitProfile.shareAchievement('${id}')" title="Share Achievement">📤</button>` : '';
            return `
                <div class="badge-item ${earned ? 'earned' : ''}">
                    <div class="badge-lock">🔒</div>
                    ${shareBtn}
                    <div class="badge-icon">${def.icon}</div>
                    <div class="badge-title">${def.title}</div>
                    <div class="badge-desc">${def.desc}</div>
                    <div class="badge-tooltip">${statusText}</div>
                </div>
            `;
        }).join('');
    }

    // (Keeping renderStatsCards, renderMastery, renderPractice, renderHistory, renderSessions, renderLearningPath as they are or with minor tweaks)
    // For brevity, I'll assume they are imported or I'll re-implement them if overwriting.
    // I'll overwrite the FULL file with these additions.

    // --- MODALS ---

    function openAvatarModal() {
        const overlay = document.createElement('div');
        overlay.className = 'gs-auth-overlay active';
        overlay.id = 'avatar-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'gs-auth-modal';
        modal.style.maxWidth = '500px';
        modal.innerHTML = `
            <h2 class="gs-auth-title">Select Avatar</h2>
            <div class="avatar-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0;">
                ${PREDEFINED_AVATARS.map(a => `
                    <div class="avatar-option" onclick="window.GanitProfile.updateAvatar('${a.url}')" style="cursor: pointer; text-align: center;">
                        <img src="${a.url}" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid transparent; transition: border 0.2s;">
                        <div style="font-size: 0.7rem; margin-top: 4px;">${a.label}</div>
                    </div>
                `).join('')}
            </div>
            <button class="gs-button gs-button-ghost" onclick="document.getElementById('avatar-modal-overlay').remove()">Cancel</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    async function updateAvatar(url) {
        try {
            await fetchWithAuth('/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: url })
            });
            location.reload();
        } catch (e) {
            alert("Failed to update avatar.");
        }
    }

    async function editDisplayName() {
        const newName = prompt("Enter new display name:", document.getElementById('profileDisplayName').innerText);
        if (!newName || newName.trim() === "") return;

        try {
            await fetchWithAuth('/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: newName.trim() })
            });
            location.reload();
        } catch (e) {
            alert("Failed to update name.");
        }
    }

    // --- SOCIAL & SHARING ---

    function shareAchievement(badgeId) {
        const badge = BADGE_VISUALS[badgeId];
        if (!badge) return;
        const text = `I just earned the "${badge.title}" badge on GanitSūtram! 🕉️✨ ${badge.desc}\n\nJoin me in exploring ancient mathematics at https://ganitsutram.com`;
        const url = window.location.href;
        
        // Native share if supported
        if (navigator.share) {
            navigator.share({ title: 'GanitSūtram Achievement', text, url }).catch(() => {});
        } else {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank');
        }
    }

    function copyProfileLink() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("Profile link copied to clipboard!");
        });
    }

    // (Re-including the rest of the rendering logic from the original profile.js)
    function renderStatsCards(stats, practiceStats) {
        const container = document.getElementById('statsGrid');
        if (!container) return;
        const favOp = (stats.operationBreakdown && Object.keys(stats.operationBreakdown).length > 0) 
            ? Object.entries(stats.operationBreakdown).sort((a, b) => b[1] - a[1])[0][0] 
            : 'None';

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

        const breakdown = stats.operationBreakdown || {};
        const userOps = Object.entries(breakdown).map(([op, count]) => ({ operation: op, count }));

        if (userOps.length === 0) {
            container.innerHTML = `
                <div class="gs-empty-state-card" style="text-align: center; padding: 2rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1);">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.8;">🔲</div>
                    <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">The Slate is Clean</div>
                    <div style="color: var(--profile-fg-dim); margin-bottom: 1.5rem;">Mastery takes time and practice. Enter the arena to begin tracking your progress across the ancient Sutras.</div>
                    <a href="${(window.GanitConfig && window.GanitConfig.LEARN_URL) ? window.GanitConfig.LEARN_URL : '/learning'}/practice.html" class="gs-button gs-button-primary" style="padding: 0.5rem 1rem;">Enter the Practice Arena</a>
                </div>
            `;
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
                ${rows || `
                    <div class="gs-empty-state-card" style="text-align: center; padding: 2rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); margin-top: 1rem;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.8;">🎯</div>
                        <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Step into the Arena</div>
                        <div style="color: var(--profile-fg-dim); margin-bottom: 1.5rem;">Test your knowledge in a timed, gamified environment and earn spiritual badges.</div>
                        <a href="${(window.GanitConfig && window.GanitConfig.LEARN_URL) ? window.GanitConfig.LEARN_URL : '/learning'}/practice.html" class="gs-button gs-button-primary" style="padding: 0.5rem 1rem;">Start Practice</a>
                    </div>
                `}
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
            container.innerHTML = rows || `
                <tr>
                    <td colspan="4" style="padding: 2rem;">
                        <div class="gs-empty-state-card" style="text-align: center; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); padding: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.8;">⏳</div>
                            <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Your Journey Awaits</div>
                            <div style="color: var(--profile-fg-dim); margin-bottom: 1.5rem;">You haven't solved any problems yet. The ancient algorithms await your command.</div>
                            <a href="${(window.GanitConfig && window.GanitConfig.SOLVER_URL) ? window.GanitConfig.SOLVER_URL : '/solver'}/index.html" class="gs-button gs-button-primary" style="padding: 0.5rem 1rem;">Open the Solver</a>
                        </div>
                    </td>
                </tr>
            `;
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

        const modules = [
            { id: 'digital-root', title: 'The Magic of Beejank', icon: '🔢', level: 'Beginner' },
            { id: 'nikhilam', title: 'Nikhilam Multiplication', icon: '⚡', level: 'Intermediate' },
            { id: 'urdhva', title: 'Urdhva Tiryak', icon: '⚔️', level: 'Advanced' },
            { id: 'squares-ending-5', title: 'Instant Squares', icon: '🔲', level: 'Beginner' }
        ];

        container.innerHTML = modules.map(m => {
            const hasSolved = stats.operationBreakdown && stats.operationBreakdown[m.id];
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

        if (!window.GanitAuth.isLoggedIn()) {
            window.location.href = (window.GanitConfig && window.GanitConfig.PORTAL_URL) ? window.GanitConfig.PORTAL_URL : '/portal';
            return;
        }

        try {
            const [meData, pStats, prStats, concepts, history, bData] = await Promise.all([
                fetchWithAuth('/auth/me'),
                fetchWithAuth('/user-progress/stats'),
                fetchWithAuth('/practice/stats'),
                fetchWithAuth('/concepts'),
                fetchWithAuth(`/user-progress?limit=${HISTORY_LIMIT}&offset=0`),
                fetchWithAuth('/user-progress/badges')
            ]);

            const user = meData.user;
            const lbMe = await fetchWithAuth('/leaderboard/me').catch(() => null);

            renderHeader(user, pStats.stats, lbMe);
            renderBadges(bData.badges);
            renderStatsCards(pStats.stats, prStats.stats);
            renderMastery(pStats.stats, concepts);
            renderPractice(prStats.stats);
            renderHistory(history.entries);
            renderLearningPath(user, pStats.stats, prStats.stats);

            loadSessions();

            const loadMoreBtn = document.getElementById('btnLoadMore');
            if (loadMoreBtn) loadMoreBtn.onclick = loadMoreHistory;

            const clearBtn = document.getElementById('btnClearHistory');
            if (clearBtn) clearBtn.onclick = clearHistory;

            const revokeAllBtn = document.getElementById('btnRevokeAllSessions');
            if (revokeAllBtn) revokeAllBtn.onclick = revokeAllOtherSessions;

        } catch (err) {
            console.error("Dashboard init failed", err);
            document.body.innerHTML += `<div style="position:fixed; top:20px; right:20px; background:#ef4444; color:#fff; padding:1rem; border-radius:8px; z-index:9999;">Error loading dashboard. Please refresh.</div>`;
        }
    }

    // EXPOSE
    window.GanitProfile = { 
        init, 
        revokeSession, 
        revokeAllOtherSessions, 
        openAvatarModal, 
        updateAvatar, 
        editDisplayName,
        shareAchievement,
        copyProfileLink
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
