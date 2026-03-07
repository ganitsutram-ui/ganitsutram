/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Leaderboard frontend interactivity.
 */

window.GanitLeaderboard = (function () {
    const API_BASE = 'http://localhost:3000/api/leaderboard';

    let currentType = 'global';
    let currentLimit = 25;
    let currentOffset = 0;

    let allBadgesData = [];
    let myBadgesData = [];
    let myProgressData = [];

    // Elements
    const ePodium = document.getElementById('lb-podium');
    const eTableBody = document.getElementById('lb-table-body');
    const eLoadMore = document.getElementById('lb-load-more');
    const eRankPanel = document.getElementById('my-rank-panel');
    const eHistoryPanel = document.getElementById('point-history-panel');
    const eBadgeGrid = document.getElementById('badge-grid');

    async function fetchLeaderboard(type, limit, offset) {
        try {
            const res = await fetch(`${API_BASE}?type=${type}&limit=${limit}&offset=${offset}`);
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function fetchMyRank() {
        if (!GanitUI.getUser()) return null;
        try {
            const res = await fetch(`${API_BASE}/me`, {
                headers: { 'Authorization': `Bearer ${GanitUI.getToken()}` }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function fetchAllBadges() {
        try {
            const res = await fetch(`${API_BASE}/badges`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data.badges;
        } catch (e) {
            return [];
        }
    }

    function animatePoints(el, from, to) {
        // Simple counter animation
        if (from === to) {
            el.innerText = to;
            return;
        }
        let current = from;
        const step = Math.max(1, Math.floor((to - from) / 20));
        const timer = setInterval(() => {
            current += step;
            if (current >= to) {
                current = to;
                clearInterval(timer);
            }
            el.innerText = current;
        }, 30);
    }

    function renderPodium(top3) {
        ePodium.innerHTML = '';
        if (!top3 || top3.length === 0) return;

        // Reorder for CSS display: [2, 1, 3]
        const displayOrder = [];
        if (top3[1]) displayOrder.push(top3[1]);
        if (top3[0]) displayOrder.push(top3[0]);
        if (top3[2]) displayOrder.push(top3[2]);

        displayOrder.forEach(player => {
            const initials = player.displayName.substring(0, 2).toUpperCase();
            const isFirst = player.rank === 1;

            const badgeIcon = player.topBadge ? GanitLeaderboard.allBadges.find(b => b.id === player.topBadge)?.icon || '' : '';

            ePodium.innerHTML += `
                <div class="podium-place rank-${player.rank}">
                    ${isFirst ? '<div class="podium-crown">👑</div>' : ''}
                    <div class="podium-avatar">${initials}</div>
                    <div class="podium-name">${player.displayName}</div>
                    <div class="podium-score">${currentType === 'weekly' ? player.weeklyPoints : player.totalPoints} pts</div>
                    <div class="podium-badge" title="Top Badge">${badgeIcon}</div>
                </div>
            `;
        });
    }

    function renderTable(entries, currentUserId, append = false) {
        if (!append) eTableBody.innerHTML = '';
        entries.forEach(p => {
            // we don't know who currentUserId is without auth matching emails exactly (unless we do alias).
            // We can match displayName if the user just updated it, rough match.
            const initial = p.displayName.charAt(0).toUpperCase();
            const badgeIcon = p.topBadge ? GanitLeaderboard.allBadges.find(b => b.id === p.topBadge)?.icon || '' : '';

            eTableBody.innerHTML += `
                <tr>
                    <td>#${p.rank}</td>
                    <td><div class="table-avatar">${initial}</div> <span class="table-name">${p.displayName}</span></td>
                    <td></td> <!-- for alignment -->
                    <td class="h-pts">${p.totalPoints}</td>
                    <td>${p.weeklyPoints}</td>
                    <td>${p.streak} 🔥</td>
                    <td>${p.badgeCount} ${badgeIcon}</td>
                </tr>
            `;
        });
    }

    function renderMyRank(meData) {
        if (!meData) {
            eRankPanel.classList.add('hidden');
            eHistoryPanel.classList.add('hidden');
            document.getElementById('filter-earned').style.display = 'none';
            document.getElementById('filter-progress').style.display = 'none';
            return;
        }

        eRankPanel.classList.remove('hidden');
        eHistoryPanel.classList.remove('hidden');
        document.getElementById('filter-earned').style.display = 'inline-block';
        document.getElementById('filter-progress').style.display = 'inline-block';

        const { rank, pointHistory, badges, badgeProgress } = meData;
        myBadgesData = badges;
        myProgressData = badgeProgress;

        document.getElementById('my-rank-global').innerText = '#' + (rank.rankGlobal || '-');
        document.getElementById('my-rank-weekly').innerText = '#' + (rank.rankWeekly || '-');
        document.getElementById('my-percentile').innerText = rank.percentile ? `Top ${rank.percentile}%` : '-';

        animatePoints(document.getElementById('my-points'), 0, rank.totalPoints);

        // Point history
        const hl = document.getElementById('point-history-list');
        hl.innerHTML = '';
        pointHistory.forEach(ev => {
            const dateStr = new Date(ev.created_at).toLocaleDateString();
            hl.innerHTML += `
                <div class="history-item">
                    <div>
                        <span class="h-reason">${ev.reason.replace(/_/g, ' ')}</span>
                        ${ev.operation ? `<span class="h-op">[${ev.operation}]</span>` : ''}
                    </div>
                    <div>
                        <span class="h-pts">+${ev.points}</span>
                        <span style="font-size:0.7rem; color:var(--gs-color-text-muted); margin-left:1rem;">${dateStr}</span>
                    </div>
                </div>
            `;
        });
    }

    function renderBadgeGrid(filter = 'all') {
        eBadgeGrid.innerHTML = '';

        let badgesToShow = [];

        if (filter === 'all') {
            badgesToShow = GanitLeaderboard.allBadges.map(b => {
                const earned = myBadgesData.find(ub => ub.id === b.id);
                const prog = myProgressData.find(up => up.id === b.id);
                return { ...b, isEarned: !!earned, date: earned ? earned.earned_at : null, progress: prog ? prog.progress : 0 };
            });
        } else if (filter === 'earned') {
            badgesToShow = myBadgesData.map(b => ({ ...b, isEarned: true, date: b.earned_at }));
        } else if (filter === 'progress') {
            badgesToShow = myProgressData
                .map(p => {
                    const bDef = GanitLeaderboard.allBadges.find(b => b.id === p.id);
                    return { ...bDef, isEarned: false, progress: p.progress };
                })
                .filter(b => b.progress > 0 && b.progress < 100);
        }

        badgesToShow.forEach(b => {
            const extra = b.isEarned
                ? `<div class="badge-date">Earned on ${new Date(b.date).toLocaleDateString()}</div>`
                : `<div class="badge-progress-bar"><div class="badge-progress-fill" style="width:${b.progress}%"></div></div><div class="badge-progress-text">${b.progress}%</div>`;

            eBadgeGrid.innerHTML += `
                <div class="badge-card ${b.isEarned ? 'earned' : 'unearned'}">
                    <div class="badge-icon">${b.icon}</div>
                    <div class="badge-title">${b.title}</div>
                    <div class="badge-desc">${b.desc}</div>
                    ${extra}
                </div>
            `;
        });
    }

    async function setAlias() {
        const input = document.getElementById('display-name-input');
        const msg = document.getElementById('alias-msg');
        const val = input.value.trim();
        msg.innerText = '';

        if (val.length < 3) return msg.innerText = "Too short!";

        try {
            const res = await fetch(`${API_BASE}/display-name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GanitUI.getToken()}`
                },
                body: JSON.stringify({ displayName: val })
            });

            if (res.ok) {
                msg.innerText = "Saved successfully!";
                msg.style.color = "var(--gs-color-success)";
                loadData(true); // reload board
            } else {
                const err = await res.json();
                msg.innerText = err.error || "Failed.";
            }
        } catch (e) {
            msg.innerText = "Network error.";
        }
    }

    async function loadData(refreshPodium = true) {
        const lbData = await fetchLeaderboard(currentType, currentLimit, currentOffset);
        if (!lbData) return;

        if (refreshPodium && currentOffset === 0) {
            renderPodium(lbData.leaderboard.slice(0, 3));
            renderTable(lbData.leaderboard.slice(3), null, false);
        } else {
            renderTable(lbData.leaderboard, null, true);
        }
    }

    async function init() {
        GanitLeaderboard.allBadges = await fetchAllBadges();

        const myData = await fetchMyRank();
        renderMyRank(myData);
        renderBadgeGrid('all');

        loadData(true);

        // Bindings
        document.querySelectorAll('.lb-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentType = e.target.dataset.type;
                currentOffset = 0;
                loadData(true);
            });
        });

        eLoadMore.addEventListener('click', () => {
            currentOffset += currentLimit;
            loadData(false);
        });

        document.getElementById('save-display-name')?.addEventListener('click', setAlias);

        document.querySelectorAll('.badge-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.badge-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderBadgeGrid(e.target.dataset.filter);
            });
        });
    }

    return { init, allBadges: [] };
})();

document.addEventListener('DOMContentLoaded', () => {
    GanitLeaderboard.init();
});
