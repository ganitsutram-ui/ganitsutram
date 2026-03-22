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
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
_attribution: "Author: Jawahar R Mallah | AITDL | VS 2082 | 2026-03-07"
*/

const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const CACHE_NAME = IS_DEV ? 'ganitsutram-dev-v1' : 'ganitsutram-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '../../ui-core/css/main.css',
    '../../ui-core/css/research-lab.css',
    '../../ui-core/js/ganit-ui.js',
    '../../ui-core/js/research-lab.js',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Unbounded:wght@400;700;900&family=Noto+Serif+Devanagari:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
                .then(response => {
                    if (response) return response;
                    return new Response(JSON.stringify({ error: "You are offline. Please reconnect." }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(event.request).then(response => {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                        return response;
                    }).catch(() => caches.match(event.request));
                })
        );
    }
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
