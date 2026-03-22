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
 * Purpose: Business logic for refresh tokens and sliding sessions.
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sessionRepo = require('../database/session-repository');

const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;

async function createRefreshSession(userId, req) {
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const sessionId = uuidv4();
    const familyId = uuidv4();

    const deviceHint = (req.headers['user-agent'] || 'unknown').slice(0, 120);
    let ipHint = 'unknown';
    if (req.ip) {
        ipHint = req.ip.split('.').slice(0, 3).join('.');
    }

    const now = new Date();
    const issuedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await sessionRepo.createSession({
        sessionId,
        userId,
        refreshTokenHash,
        familyId,
        deviceHint,
        ipHint,
        issuedAt,
        expiresAt
    });

    return { rawRefreshToken, sessionId, expiresAt };
}

async function rotateRefreshSession(rawRefreshToken, req) {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const session = await sessionRepo.findByTokenHash(tokenHash);

    if (!session) {
        throw new Error('Invalid refresh token');
    }

    if (session.revoked === 1) {
        throw new Error('Session revoked');
    }

    if (session.rotated === 1) {
        // SECURITY: Token reuse detected. Attacker or race condition. We must terminate the entire session lineage.
        await sessionRepo.revokeFamilyId(session.family_id);
        throw new Error('Refresh token reuse detected. All sessions in this chain are revoked.');
    }

    const nowStr = new Date().toISOString();
    if (session.expires_at < nowStr) {
        throw new Error('Refresh token expired');
    }

    // Happy Path: Evaluate the new token
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
    const newSessionId = uuidv4();

    const deviceHint = (req.headers['user-agent'] || 'unknown').slice(0, 120);
    let ipHint = 'unknown';
    if (req.ip) {
        ipHint = req.ip.split('.').slice(0, 3).join('.');
    }

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await sessionRepo.rotateSession(session.session_id, {
        sessionId: newSessionId,
        userId: session.user_id,
        refreshTokenHash: newRefreshTokenHash,
        familyId: session.family_id,
        deviceHint,
        ipHint,
        issuedAt: nowStr,
        expiresAt: newExpiresAt
    });

    return { rawRefreshToken: newRawRefreshToken, sessionId: newSessionId, userId: session.user_id };
}

async function revokeSession(sessionId, userId) {
    const list = await sessionRepo.getActiveSessions(userId);
    const ownsSession = list.some(s => s.sessionId === sessionId);
    if (!ownsSession) return;
    return await sessionRepo.revokeSession(sessionId);
}

async function revokeAllSessions(userId) {
    return await sessionRepo.revokeAllUserSessions(userId);
}

async function listSessions(userId) {
    return await sessionRepo.getActiveSessions(userId);
}

module.exports = {
    createRefreshSession,
    rotateRefreshSession,
    revokeSession,
    revokeAllSessions,
    listSessions
};
