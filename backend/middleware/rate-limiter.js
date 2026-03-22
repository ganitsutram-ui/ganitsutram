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
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Rate limiting middleware to prevent brute force and DoS attacks.
 */

const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../services/i18n-service');
const securityRepo = require('../database/security-repository');
const ipBlacklist = require('./ip-blacklist');
const threatDetector = require('./threat-detector');

const isTest = process.env.NODE_ENV === 'test';
const bypassLimit = (req, res, next) => next();

const globalLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per IP
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.tooManyRequests', { minutes: 15 }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
        const ip = req.clientIP;
        await threatDetector.handleThreat(ip, 'rate_abuse', req, false);
        return res.status(429).json(
            errorResponse(req.locale || 'en', 'errors.rate.tooManyRequests', { minutes: 15 })
        );
    }
});

const authLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per IP
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.authLimit'),
    standardHeaders: true,
    legacyHeaders: false
});

const forgotPasswordLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 5, // 5 requests per IP
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.resetLimit'),
    standardHeaders: true,
    legacyHeaders: false
});

const solveLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per IP
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.solverLimit'),
    standardHeaders: true,
    legacyHeaders: false
});

const patternLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per IP
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.tooManyRequests', { minutes: 1 }),
    standardHeaders: true,
    legacyHeaders: false
});

const adminLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.tooManyRequests', { minutes: 15 }),
    standardHeaders: true,
    legacyHeaders: false
});

const beaconLimiter = isTest ? bypassLimit : rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 requests per IP (allows normal page navigation, blocks obvious flood bots)
    message: (req, res) => errorResponse(req.locale || 'en', 'errors.rate.beaconLimit'),
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    globalLimiter,
    authLimiter,
    forgotPasswordLimiter,
    solveLimiter,
    patternLimiter,
    adminLimiter,
    beaconLimiter
};
