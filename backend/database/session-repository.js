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
 * Purpose: Repository pattern for refresh_sessions table logic.
 */

const db = require('./db');

async function createSession({ sessionId, userId, refreshTokenHash, familyId, deviceHint, ipHint, issuedAt, expiresAt }) {
    return await db.run(`
        INSERT INTO refresh_sessions (
            session_id, user_id, refresh_token_hash, family_id, 
            device_hint, ip_hint, issued_at, expires_at, last_used_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, sessionId, userId, refreshTokenHash, familyId, deviceHint, ipHint, issuedAt, expiresAt, issuedAt);
}

async function findByTokenHash(refreshTokenHash) {
    return await db.get('SELECT * FROM refresh_sessions WHERE refresh_token_hash = ?', refreshTokenHash);
}

async function findByFamilyId(familyId) {
    return await db.all('SELECT * FROM refresh_sessions WHERE family_id = ?', familyId);
}

async function rotateSession(oldSessionId, newSession) {
    await db.transaction(async (tx) => {
        await tx.run('UPDATE refresh_sessions SET rotated = 1 WHERE session_id = ?', oldSessionId);

        await tx.run(`
            INSERT INTO refresh_sessions (
                session_id, user_id, refresh_token_hash, family_id, 
                device_hint, ip_hint, issued_at, expires_at, last_used_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            newSession.sessionId, newSession.userId, newSession.refreshTokenHash,
            newSession.familyId, newSession.deviceHint, newSession.ipHint,
            newSession.issuedAt, newSession.expiresAt, newSession.issuedAt
        );
    });
}

async function revokeSession(sessionId) {
    return await db.run('UPDATE refresh_sessions SET revoked = 1 WHERE session_id = ?', sessionId);
}

async function revokeAllUserSessions(userId) {
    return await db.run('UPDATE refresh_sessions SET revoked = 1 WHERE user_id = ?', userId);
}

async function revokeFamilyId(familyId) {
    return await db.run('UPDATE refresh_sessions SET revoked = 1 WHERE family_id = ?', familyId);
}

async function getActiveSessions(userId) {
    return await db.all(`
        SELECT session_id as sessionId, device_hint as deviceHint, 
               ip_hint as ipHint, issued_at as issuedAt, last_used_at as lastUsedAt
        FROM refresh_sessions 
        WHERE user_id = ? AND rotated = 0 AND revoked = 0
    `, userId);
}

async function updateLastUsed(sessionId, lastUsedAt) {
    return await db.run('UPDATE refresh_sessions SET last_used_at = ? WHERE session_id = ?', lastUsedAt, sessionId);
}

async function deleteExpiredSessions() {
    const now = new Date().toISOString();
    const info = await db.run('DELETE FROM refresh_sessions WHERE expires_at < ?', now);
    return info.changes;
}

module.exports = {
    createSession,
    findByTokenHash,
    findByFamilyId,
    rotateSession,
    revokeSession,
    revokeAllUserSessions,
    revokeFamilyId,
    getActiveSessions,
    updateLastUsed,
    deleteExpiredSessions
};
