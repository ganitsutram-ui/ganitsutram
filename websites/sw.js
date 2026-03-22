/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * Advanced Service Worker — "Mahaveer Offline Mode"
 * Implements Stale-While-Revalidate for premium performance.
 */

const CACHE_NAME = 'gs-pwa-v2.0';
const STATIC_CACHE = 'gs-static-assets-v1';

// Assets to pre-cache on install
const PRE_CACHE_ASSETS = [
    '/',
    '/index.html',
    '/portal/index.html',
    '/portal/gate.html',
    '/learning/profile.html',
    '/ui-core/css/main.css',
    '/ui-core/css/portal.css',
    '/ui-core/css/i18n.css',
    '/ui-core/js/config.js',
    '/ui-core/js/i18n.js',
    '/ui-core/js/ganit-ui.js',
    '/ui-core/locales/en.json',
    '/ui-core/locales/hi.json',
    '/ui-core/locales/sa.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                PRE_CACHE_ASSETS.map(url => cache.add(url))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE).map(k => caches.delete(k)))
        )
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Bypass Service Worker for API calls
    if (url.pathname.startsWith('/api/') || url.port === '5002' || url.hostname.includes('onrender.com')) {
        return;
    }

    // 2. Strategy: Stale-While-Revalidate for everything else
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    // Only cache successful GET responses
                    if (networkResponse.ok && event.request.method === 'GET') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fallback handled by cachedResponse or return undefined
                    return cachedResponse;
                });

                return cachedResponse || fetchedResponse;
            });
        })
    );
});
