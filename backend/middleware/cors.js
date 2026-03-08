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
'use strict';
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL
VS 2082 | 2026-03-08
*/

const cors = require('cors');

const PROD_ORIGINS = [
    'https://ganitsutram.com',
    'https://discover.ganitsutram.com',
    'https://learn.ganitsutram.com',
    'https://map.ganitsutram.com',
    'https://lab.ganitsutram.com',
    'https://solve.ganitsutram.com'
];

const DEV_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5173',   // Vite
    'http://localhost:4200'    // future Angular
];

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
    ? PROD_ORIGINS
    : [...PROD_ORIGINS, ...DEV_ORIGINS];

module.exports = cors({
    origin: (origin, callback) => {
        // Allow non-browser tools (Postman, curl)
        // and same-origin requests in dev
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept-Language',
        'X-Requested-With'
    ]
});

module.exports.ALLOWED_ORIGINS = ALLOWED_ORIGINS;
