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

function createSession({ sessionId, userId, refreshTokenHash, familyId, deviceHint, ipHint, issuedAt, expiresAt }) {
    const stmt = db.prepare(`
        INSERT INTO refresh_sessions (
            session_id, user_id, refresh_token_hash, family_id, 
            device_hint, ip_hint, issued_at, expires_at, last_used_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
        sessionId, userId, refreshTokenHash, familyId,
        deviceHint, ipHint, issuedAt, expiresAt, issuedAt
    );
    return info;
}

function findByTokenHash(refreshTokenHash) {
    return db.prepare('SELECT * FROM refresh_sessions WHERE refresh_token_hash = ?').get(refreshTokenHash);
}

function findByFamilyId(familyId) {
    return db.prepare('SELECT * FROM refresh_sessions WHERE family_id = ?').all(familyId);
}

function rotateSession(oldSessionId, newSession) {
    const rotate = db.transaction((oldId, newSess) => {
        db.prepare('UPDATE refresh_sessions SET rotated = 1 WHERE session_id = ?').run(oldId);
        createSession(newSess);
    });
    rotate(oldSessionId, newSession);
}

function revokeSession(sessionId) {
    return db.prepare('UPDATE refresh_sessions SET revoked = 1 WHERE session_id = ?').run(sessionId);
}

function revokeAllUserSessions(userId) {
    return db.prepare('UPDATE refresh_sessions SET revoked = 1 WHERE user_id = ?').run(userId);
}

function revokeFamilyId(familyId) {
    return db.prepare('UPDATE refresh_sessions SET revoked = 1 WHERE family_id = ?').run(familyId);
}

function getActiveSessions(userId) {
    return db.prepare(`
        SELECT session_id as sessionId, device_hint as deviceHint, 
               ip_hint as ipHint, issued_at as issuedAt, last_used_at as lastUsedAt
        FROM refresh_sessions 
        WHERE user_id = ? AND rotated = 0 AND revoked = 0
    `).all(userId);
}

function updateLastUsed(sessionId, lastUsedAt) {
    return db.prepare('UPDATE refresh_sessions SET last_used_at = ? WHERE session_id = ?').run(lastUsedAt, sessionId);
}

function deleteExpiredSessions() {
    const now = new Date().toISOString();
    const info = db.prepare('DELETE FROM refresh_sessions WHERE expires_at < ?').run(now);
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
