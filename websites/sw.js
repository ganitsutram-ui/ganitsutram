/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 */

const CACHE_NAME = 'gs-static-v1.1';
const ASSETS = [
    '/',
    '/portal/index.html',
    '/ui-core/css/main.css',
    '/ui-core/css/portal.css',
    '/ui-core/css/i18n.css',
    '/ui-core/js/config.js',
    '/ui-core/js/i18n.js',
    '/ui-core/js/ganit-ui.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
