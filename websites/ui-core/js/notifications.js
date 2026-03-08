/*
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: In-app notification system frontend.
 *          Bell icon, dropdown panel, toast alerts, SSE client, prefs panel.
 */

(function () {
    'use strict';

    const { API_BASE, SSE_URL } = window.GanitConfig;
    const API = `${API_BASE.replace('/api', '')}/api/notifications`;
    let _token = null;
    let _sse = null;
    let _sseRetryMs = 2000;
    let _dropdownOpen = false;

    // ─── PUBLIC API ────────────────────────────────────────────────────────

    window.GanitNotifications = {

        /**
         * Initialize the notification system for a logged-in user.
         */
        init(token) {
            _token = token;
            fetchUnreadCount().then(count => updateBell(count));
            connectSSE(token);
        },

        markRead,
        markAllRead,
        renderPrefsPanel,
        fetchNotifications,
        fetchUnreadCount
    };

    // ─── SSE CONNECTION ────────────────────────────────────────────────────

    function connectSSE(token) {
        if (_sse) { _sse.close(); }

        try {
            _sse = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token)}`);

            _sse.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'heartbeat') return;
                    if (data.type === 'init') { updateBell(data.unreadCount); return; }
                    // New real-time notification
                    prependToDropdown(data);
                    fetchUnreadCount().then(count => updateBell(count));
                    showToast(data);
                    _sseRetryMs = 2000; // Reset backoff on success
                } catch (err) { /* malformed message */ }
            };

            _sse.onerror = () => {
                _sse.close();
                _sse = null;
                // Exponential backoff, max 30s
                setTimeout(() => connectSSE(token), Math.min(_sseRetryMs, 30000));
                _sseRetryMs = Math.min(_sseRetryMs * 2, 30000);
            };
        } catch (e) {
            // EventSource not supported or connection refused
        }
    }

    // ─── API CALLS ─────────────────────────────────────────────────────────

    async function fetchNotifications(options = {}) {
        if (!_token) return [];
        try {
            const params = new URLSearchParams();
            if (options.read !== undefined) params.set('read', options.read ? '1' : '0');
            if (options.limit) params.set('limit', options.limit);
            if (options.offset) params.set('offset', options.offset);

            const res = await fetch(`${API}?${params}`, {
                headers: { 'Authorization': `Bearer ${_token}` }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.notifications || [];
        } catch { return []; }
    }

    async function fetchUnreadCount() {
        if (!_token) return 0;
        try {
            const res = await fetch(`${API}/unread-count`, {
                headers: { 'Authorization': `Bearer ${_token}` }
            });
            if (!res.ok) return 0;
            const data = await res.json();
            return data.count || 0;
        } catch { return 0; }
    }

    async function markRead(id) {
        if (!_token) return;
        try {
            await fetch(`${API}/read/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${_token}` }
            });
            const count = await fetchUnreadCount();
            updateBell(count);
        } catch { /* silent */ }
    }

    async function markAllRead() {
        if (!_token) return;
        try {
            await fetch(`${API}/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${_token}` }
            });
            updateBell(0);
            openDropdown(); // Re-render
        } catch { /* silent */ }
    }

    // ─── BELL ICON ─────────────────────────────────────────────────────────

    function updateBell(count) {
        const badge = document.getElementById('gsBellBadge');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // ─── DROPDOWN ──────────────────────────────────────────────────────────

    async function openDropdown() {
        const dropdown = document.getElementById('gsNotifDropdown');
        if (!dropdown) return;

        dropdown.classList.remove('hidden');
        _dropdownOpen = true;

        dropdown.innerHTML = `<div class="gs-notif-loading">Loading…</div>`;
        const notifications = await fetchNotifications({ limit: 20 });
        renderDropdown(notifications, dropdown);

        // Mark all read after 2s delay
        setTimeout(() => {
            markAllRead().then(() => { /* silent */ });
        }, 2000);
    }

    function closeDropdown() {
        const dropdown = document.getElementById('gsNotifDropdown');
        if (dropdown) dropdown.classList.add('hidden');
        _dropdownOpen = false;
    }

    function renderDropdown(notifications, container) {
        const unread = notifications.filter(n => !n.read).length;
        let html = `<div class="gs-notif-header">
            <span class="gs-notif-heading">Notifications</span>
            ${unread > 0 ? `<button class="gs-notif-mark-all" onclick="GanitNotifications.markAllRead()">Mark all read</button>` : ''}
        </div>`;

        if (notifications.length === 0) {
            html += `<div class="gs-notif-empty">You're all caught up! ✓</div>`;
        } else {
            notifications.forEach(n => {
                html += renderNotifItem(n);
            });
            html += `<div class="gs-notif-footer"><a href="/portal/index.html#notifications">View all</a></div>`;
        }

        container.innerHTML = html;
    }

    function renderNotifItem(n) {
        const readClass = n.read ? '' : ' unread';
        const body = n.body.length > 80 ? n.body.slice(0, 80) + '…' : n.body;
        const action = n.action_url
            ? `onclick="GanitNotifications.markRead('${n.notification_id}'); window.location='${n.action_url}'"`
            : `onclick="GanitNotifications.markRead('${n.notification_id}')"`;
        return `
        <div class="gs-notif-item${readClass}" ${action}>
            <div class="gs-notif-icon">${n.icon || 'ℹ️'}</div>
            <div class="gs-notif-content">
                <div class="gs-notif-title">${escapeHtml(n.title)}</div>
                <div class="gs-notif-body">${escapeHtml(body)}</div>
                <div class="gs-notif-time">${timeAgo(n.created_at)}</div>
            </div>
        </div>`;
    }

    function prependToDropdown(notification) {
        const dropdown = document.getElementById('gsNotifDropdown');
        if (!dropdown || dropdown.classList.contains('hidden')) return;

        const emptyEl = dropdown.querySelector('.gs-notif-empty');
        if (emptyEl) emptyEl.remove();

        const item = document.createElement('div');
        item.innerHTML = renderNotifItem(notification);
        const header = dropdown.querySelector('.gs-notif-header');
        if (header && header.nextSibling) {
            dropdown.insertBefore(item.firstElementChild, header.nextSibling);
        }
    }

    // ─── TOAST ─────────────────────────────────────────────────────────────

    function showToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'gs-notif-toast';
        toast.innerHTML = `
            <div class="gs-toast-icon">${notification.icon || 'ℹ️'}</div>
            <div>
                <div class="gs-toast-title">${escapeHtml(notification.title)}</div>
                ${notification.action_label ? `<div class="gs-toast-action">${escapeHtml(notification.action_label)}</div>` : ''}
            </div>`;

        if (notification.action_url) {
            toast.style.cursor = 'pointer';
            toast.onclick = () => {
                markRead(notification.notification_id);
                window.location = notification.action_url;
                toast.remove();
            };
        }

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 350);
        }, 4000);
    }

    // ─── PREFS PANEL ───────────────────────────────────────────────────────

    async function renderPrefsPanel(containerEl) {
        if (!_token || !containerEl) return;

        containerEl.innerHTML = `<div class="gs-notif-loading">Loading preferences…</div>`;
        try {
            const res = await fetch(`${API}/prefs`, {
                headers: { 'Authorization': `Bearer ${_token}` }
            });
            const data = await res.json();
            const prefs = data.prefs || {};

            const LABELS = {
                badge_earned: 'Badge Earned',
                rank_up: 'Rank Changes',
                rank_milestone: 'Rank Milestones',
                streak_milestone: 'Streak Alerts',
                practice_result: 'Practice Results',
                content_published: 'New Content',
                system: 'System Alerts',
                weekly_reset: 'Weekly Summary',
                email_badge: '📧 Email: Badge Earned',
                email_milestone: '📧 Email: Milestones',
                email_system: '📧 Email: System Alerts'
            };

            let html = `<div class="gs-prefs-panel"><h3>Notification Preferences</h3>`;
            for (const [key, label] of Object.entries(LABELS)) {
                const checked = prefs[key] === 1 || prefs[key] === undefined ? 'checked' : '';
                html += `
                <label class="gs-pref-row">
                    <span>${label}</span>
                    <input type="checkbox" class="gs-pref-toggle" data-key="${key}" ${checked}>
                </label>`;
            }
            html += `<div class="gs-pref-saved hidden" id="gsPrefsSaved">Preferences saved.</div></div>`;
            containerEl.innerHTML = html;

            // Wire up toggles with debounce
            let saveTimer = null;
            containerEl.querySelectorAll('.gs-pref-toggle').forEach(input => {
                input.addEventListener('change', () => {
                    clearTimeout(saveTimer);
                    saveTimer = setTimeout(async () => {
                        const updated = {};
                        containerEl.querySelectorAll('.gs-pref-toggle').forEach(inp => {
                            updated[inp.dataset.key] = inp.checked ? 1 : 0;
                        });
                        await fetch(`${API}/prefs`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_token}` },
                            body: JSON.stringify(updated)
                        });
                        const saved = document.getElementById('gsPrefsSaved');
                        if (saved) {
                            saved.classList.remove('hidden');
                            setTimeout(() => saved.classList.add('hidden'), 2000);
                        }
                    }, 500);
                });
            });
        } catch {
            containerEl.innerHTML = `<p>Could not load preferences.</p>`;
        }
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────

    function timeAgo(iso) {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        if (diff < 60000) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (hours < 48) return 'yesterday';
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ─── BELL INIT ─────────────────────────────────────────────────────────

    /**
     * Called by ganit-ui.js after injecting the bell HTML.
     * Wires up click and outside-click handlers.
     */
    window.GanitNotifications._initBell = function () {
        const bellBtn = document.getElementById('gsBellBtn');
        if (!bellBtn) return;

        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (_dropdownOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        document.addEventListener('click', (e) => {
            const bell = document.getElementById('gsNotifBell');
            if (bell && !bell.contains(e.target) && _dropdownOpen) {
                closeDropdown();
            }
        });
    };

})();
