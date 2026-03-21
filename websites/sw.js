/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * Service Worker — Static-only cache.
 * API calls are NOT cached (they live on a different port in dev).
 */

const CACHE_NAME = 'gs-static-v1.2';

// Only cache resources that are guaranteed to exist on port 5001
const ASSETS = [
    '/websites/portal/index.html',
    '/websites/portal/gate.html',
    '/websites/ui-core/css/main.css',
    '/websites/ui-core/css/portal.css',
    '/websites/ui-core/css/i18n.css',
    '/websites/ui-core/js/config.js',
    '/websites/ui-core/js/i18n.js',
    '/websites/ui-core/js/ganit-ui.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // addAll with individual error handling — one bad URL won't kill install
            return Promise.allSettled(
                ASSETS.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('[SW] Failed to cache:', url, err);
                    })
                )
            );
        })
    );
    // Immediately take control without waiting for old SW to die
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Remove stale caches
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => {
                    console.log('[SW] Removing old cache:', k);
                    return caches.delete(k);
                })
            )
        )
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Let API calls (port 5002) pass through — never intercept them
    const url = new URL(event.request.url);
    if (url.port === '5002' || url.pathname.startsWith('/api/')) {
        return; // bypass SW for API requests
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => fetch(event.request))
    );
});
