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

function createRefreshSession(userId, req) {
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

    sessionRepo.createSession({
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

function rotateRefreshSession(rawRefreshToken, req) {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const session = sessionRepo.findByTokenHash(tokenHash);

    if (!session) {
        throw new Error('Invalid refresh token');
    }

    if (session.revoked === 1) {
        throw new Error('Session revoked');
    }

    if (session.rotated === 1) {
        // SECURITY: Token reuse detected. Attacker or race condition. We must terminate the entire session lineage.
        sessionRepo.revokeFamilyId(session.family_id);
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

    sessionRepo.rotateSession(session.session_id, {
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

function revokeSession(sessionId, userId) {
    const list = sessionRepo.getActiveSessions(userId);
    const ownsSession = list.some(s => s.sessionId === sessionId);
    if (!ownsSession) return;
    return sessionRepo.revokeSession(sessionId);
}

function revokeAllSessions(userId) {
    return sessionRepo.revokeAllUserSessions(userId);
}

function listSessions(userId) {
    return sessionRepo.getActiveSessions(userId);
}

module.exports = {
    createRefreshSession,
    rotateRefreshSession,
    revokeSession,
    revokeAllSessions,
    listSessions
};
