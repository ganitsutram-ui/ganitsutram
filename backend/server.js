/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Backend entry point for GanitSūtram.
 *          Handles routing, middleware, and database connectivity.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { corsOptions } = require('./middleware/cors');
const db = require('./database/db');
const ipBlacklist = require('./middleware/ip-blacklist');
const threatDetector = require('./middleware/threat-detector');
const securityRepo = require('./database/security-repository');

// Import routes
const solveRoutes = require('./api/solve');
const analyticsRoutes = require('./api/analytics');
const leaderboardRoutes = require('./api/leaderboard');
const practiceRoutes = require('./api/practice');
const discoveryRoutes = require('./api/discoveries');
const conceptRoutes = require('./api/concepts');
const progressRoutes = require('./api/user-progress');
const adminRoutes = require('./api/admin');
const patternRoutes = require('./api/patterns');
const securityRoutes = require('./api/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(ipBlacklist); // 1. IP Blacklist (FIRST)
app.use(helmet());     // 2. Security headers
app.use(cors(corsOptions)); // 3. CORS
app.use(express.json({ limit: '10kb' })); // 4. Body parsing with limit

// 5. Threat Detector (runs after body parsing)
app.use(threatDetector);

// 6. Static Files
app.use(express.static(path.join(__dirname, '../websites')));

// Static routing for the root
app.get('/', (req, res) => {
    res.redirect('/portal/index.html');
});

// Routes
app.use('/api/solve', solveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/discoveries', discoveryRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/user-progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/security', securityRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'up',
        db: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
        time: new Date().toISOString(),
        attribution: "GanitSūtram | AITDL"
    });
});

// App Listen
app.listen(PORT, () => {
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
    console.log(`[Server] GanitSūtram backend running on port ${PORT}`);
    console.log(`[Server] Database adapter: ${dbType}`);

    // Hourly prune of expired IP blocks
    setInterval(async () => {
        try {
            const pruned = await securityRepo.pruneExpired();
            if (pruned > 0) {
                console.log(`[Security] Pruned ${pruned} expired IPs`);
            }
        } catch (err) {
            console.error('[Security Prune] Job failed:', err.message);
        }
    }, 60 * 60 * 1000);
});

module.exports = app;
