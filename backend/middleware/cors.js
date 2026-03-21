'use strict';
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL
VS 2082 | 2026-03-08
*/

const cors = require('cors');

const PROD_ORIGINS = [
    'http://localhost:5173',
    '',
    '',
    '',
    '',
    ''
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
        // and same-origin requests in dev, plus any github pages site or cloudflare pages
        if (!origin || ALLOWED_ORIGINS.includes(origin) || (origin && (origin.endsWith('.github.io') || origin.endsWith('.pages.dev') || origin.endsWith('ganitsutram.com')))) {
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
