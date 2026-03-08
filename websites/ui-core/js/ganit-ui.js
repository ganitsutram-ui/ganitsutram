/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/

/**
 * Shared UI Logic for GanitSūtram.
 * Ensures consistent behavior and attribution across all websites.
 */
const { API_BASE, PORTAL_URL } = window.GanitConfig;

document.addEventListener('DOMContentLoaded', () => {
    console.log("%cGANITSUTRAM", "color: #ff5500; font-weight: bold; font-size: 20px;");
    console.log("System Architect: Jawahar R Mallah");
    console.log("Organization: AITDL | aitdl.com");
});

window.GanitUI = window.GanitUI || {};

/**
 * Basic Markdown to HTML renderer using regex.
 */
window.GanitUI.renderMarkdown = function (text) {
    if (!text) return '';
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
        .replace(/^\s*>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\n<ul>/gim, '')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\n$/gim, '<br />');

    return html.split('\n').map(line => {
        if (!line.match(/<(h1|h2|h3|li|ul|blockquote|br)/)) {
            return `<p>${line}</p>`;
        }
        return line;
    }).join('');
};


// ─── TELEMETRY ───────────────────────────────────────────
window.GanitUI.sendBeacon = function (eventType, metadata = {}) {
    // Fire and forget
    setTimeout(() => {
        if (window.GanitConfig?.ENABLE_ANALYTICS_BEACON) {
            fetch(`${GanitConfig.API_BASE.replace('/api', '')}/api/analytics/beacon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, metadata })
            }).catch(() => { }); // Suppress errors silently
        }
    }, 10);
};

// ─── GATE LOGIC ──────────────────────────────────────────
window.GanitUI.gate = (function () {
    let selectedPersona = null;

    function switchScene(sceneId) {
        const current = document.querySelector('.gs-scene.active');
        const next = document.getElementById(sceneId);

        if (current) current.classList.remove('active');
        if (next) {
            next.classList.add('active');
        }
    }

    return {
        start: () => {
            switchScene('gs-scene-selection');
        },

        select: (element) => {
            // Remove selection from all cards
            document.querySelectorAll('.gs-persona-card').forEach(card => card.classList.remove('selected'));

            // Highlight selected card
            element.classList.add('selected');
            selectedPersona = {
                name: element.querySelector('h3').textContent,
                url: element.getAttribute('data-url')
            };

            // Enable proceed button
            const btn = document.getElementById('gs-btn-proceed');
            btn.classList.remove('disabled');
            btn.removeAttribute('disabled');
        },

        proceed: () => {
            if (!selectedPersona) return;

            // Update redirect text
            document.getElementById('gs-redirect-persona').textContent = selectedPersona.name;

            // Switch to redirect scene
            switchScene('gs-scene-redirect');

            // 2s Redirect Timer
            setTimeout(() => {
                window.location.href = selectedPersona.url;
            }, 2000);
        }
    };
})();

// ─── PWA INSTALL PROMPT ──────────────────────────────────
window.GanitUI.pwa = (function () {
    let deferredPrompt;

    function initInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;

            // Check if user previously dismissed it
            if (localStorage.getItem('gs_install_dismissed')) {
                return;
            }

            // Show custom banner after 30 seconds
            setTimeout(showInstallBanner, 30000);
        });

        window.addEventListener('appinstalled', () => {
            window.GanitUI.sendBeacon('app_installed', { context: 'pwa' });
            hideInstallBanner();
            deferredPrompt = null;
        });
    }

    function showInstallBanner() {
        if (!deferredPrompt || document.getElementById('gs-pwa-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'gs-pwa-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: var(--bg-deep, #040110);
            border-top: 1px solid var(--accent-soft, rgba(255,179,0,0.4));
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10000;
            font-family: var(--font-main, sans-serif);
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            color: white;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
        `;

        banner.innerHTML = `
            <div style="display:flex; align-items:center; gap: 1rem;">
                <div style="font-size: 1.5rem;">📱</div>
                <div style="font-size: 0.9rem; font-weight: 500;">Install GanitSūtram as an app</div>
            </div>
            <div style="display:flex; align-items:center; gap: 1rem;">
                <button id="pwa-install-btn" style="background:var(--accent-primary, #ff5500); color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer;">Install &rarr;</button>
                <button id="pwa-dismiss-btn" style="background:transparent; border:none; color:rgba(255,255,255,0.5); font-size:1.2rem; cursor:pointer;" aria-label="Dismiss">&times;</button>
            </div>
        `;

        document.body.appendChild(banner);

        // Slide up
        requestAnimationFrame(() => {
            banner.style.transform = 'translateY(0)';
        });

        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            hideInstallBanner();
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    window.GanitUI.sendBeacon('pwa_install_accepted');
                } else {
                    window.GanitUI.sendBeacon('pwa_install_dismissed');
                }
                deferredPrompt = null;
            }
        });

        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
            localStorage.setItem('gs_install_dismissed', '1');
            window.GanitUI.sendBeacon('pwa_prompt_dismissed');
            hideInstallBanner();
        });
    }

    function hideInstallBanner() {
        const banner = document.getElementById('gs-pwa-banner');
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 400);
        }
    }

    return { init: initInstallPrompt };
})();

// ─── SEARCH BAR ──────────────────────────────────────────────
window.GanitUI.injectSearchBar = function () {
    if (document.getElementById('gsSearchBar')) return;

    const searchHTML = `
        <div class="gs-search-bar" id="gsSearchBar">
            <input type="text" class="gs-search-input" id="gsSearchInput"
                   placeholder="Search GanitSūtram…" autocomplete="off"
                   aria-label="Search GanitSūtram">
            <div class="gs-search-dropdown hidden" id="gsSearchDropdown"></div>
        </div>`;

    const insertTargets = [
        document.querySelector('.gs-nav-actions'),
        document.querySelector('.gs-nav-links'),
        document.querySelector('nav'),
        document.querySelector('header')
    ];

    for (const target of insertTargets) {
        if (target) {
            target.insertAdjacentHTML('beforeend', searchHTML);
            break;
        }
    }

    if (window.GanitSearch) {
        window.GanitSearch.initBar();
    }
};

// ─── NOTIFICATION BELL ───────────────────────────────────
window.GanitUI.injectBell = function () {
    const token = localStorage.getItem('gs_token');
    if (!token) return;

    // Inject after nav auth section if not already present
    if (document.getElementById('gsNotifBell')) return;

    const bellHTML = `
        <div class="gs-notif-bell" id="gsNotifBell">
            <button class="gs-bell-btn" id="gsBellBtn" aria-label="Notifications" title="Notifications">
                🔔
                <span class="gs-bell-badge hidden" id="gsBellBadge">0</span>
            </button>
            <div class="gs-notif-dropdown hidden" id="gsNotifDropdown"></div>
        </div>`;

    // Try nav-actions container first, then gs-nav-links, then nav
    const insertTargets = [
        document.querySelector('.gs-nav-actions'),
        document.querySelector('.gs-nav-links'),
        document.querySelector('nav'),
        document.querySelector('header')
    ];

    for (const target of insertTargets) {
        if (target) {
            target.insertAdjacentHTML('beforeend', bellHTML);
            break;
        }
    }

    // Init notification system
    if (window.GanitNotifications) {
        window.GanitNotifications.init(token);
        window.GanitNotifications._initBell();
    }
};

// Automatically track page views on load for every page linking UI Core
// and initialize PWA install prompt listeners
function initCoreSystems() {
    window.GanitUI.sendBeacon('page_view', { page: document.title });
    window.GanitUI.pwa.init();
    if (window.GanitSEO) {
        window.GanitSEO.init();
    }

    // Init i18n
    if (window.GanitI18n) {
        const lang = localStorage.getItem('gs_locale') || 'en';
        window.GanitI18n.init(lang).then(() => {
            window.GanitI18n.initSwitcher();
            // Apply font overrides
            if (lang === 'hi') document.body.classList.add('font-hi');
            if (lang === 'sa') document.body.classList.add('font-sa');
        });
    }

    // Inject notification bell for logged-in users (slight delay for auth to settle)
    setTimeout(() => {
        window.GanitUI.injectSearchBar();
        window.GanitUI.injectBell();
    }, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreSystems);
} else {
    initCoreSystems();
}
