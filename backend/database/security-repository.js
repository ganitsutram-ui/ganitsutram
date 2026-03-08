/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: Repository for security-related data (blacklist, whitelist, threats).
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function isBlacklisted(ip) {
    const now = new Date().toISOString();
    const row = await db.get('SELECT * FROM ip_blacklist WHERE ip = ?', ip);

    if (!row) return false;

    // Check expiration
    if (row.expires_at && new Date(row.expires_at) < new Date(now)) {
        await removeFromBlacklist(ip);
        return false;
    }

    // Update last seen and request count (async)
    db.run('UPDATE ip_blacklist SET request_count = request_count + 1, last_seen = ? WHERE ip = ?', now, ip).catch(() => { });

    return true;
}

async function blacklistIP(ip, reason, expiresInMinutes = null, blockedBy = 'system') {
    const id = uuidv4();
    const now = new Date().toISOString();
    let expiresAt = null;

    if (expiresInMinutes) {
        expiresAt = new Date(Date.now() + expiresInMinutes * 60000).toISOString();
    }

    await db.run(`
        INSERT INTO ip_blacklist (id, ip, reason, blocked_at, expires_at, blocked_by, request_count, last_seen)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        ON CONFLICT(ip) DO UPDATE SET
            reason = excluded.reason,
            blocked_at = excluded.blocked_at,
            expires_at = excluded.expires_at,
            blocked_by = excluded.blocked_by
    `, id, ip, reason, now, expiresAt, blockedBy, now);
}

async function whitelistIP(ip, label = null, addedBy = 'admin') {
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
        INSERT INTO ip_whitelist (id, ip, label, added_by, added_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(ip) DO NOTHING
    `, id, ip, label, addedBy, now);
}

async function isWhitelisted(ip) {
    const row = await db.get('SELECT 1 FROM ip_whitelist WHERE ip = ?', ip);
    return !!row;
}

async function removeFromBlacklist(ip) {
    await db.run('DELETE FROM ip_blacklist WHERE ip = ?', ip);
}

async function removeFromWhitelist(ip) {
    await db.run('DELETE FROM ip_whitelist WHERE ip = ?', ip);
}

async function getBlacklist({ limit = 50, offset = 0, active = true } = {}) {
    const now = new Date().toISOString();
    let sql = 'SELECT * FROM ip_blacklist';
    const params = [];

    if (active) {
        sql += ' WHERE (expires_at IS NULL OR expires_at > ?)';
        params.push(now);
    }

    sql += ' ORDER BY blocked_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.all(sql, ...params);
}

async function getAllWhitelist() {
    return await db.all('SELECT * FROM ip_whitelist ORDER BY added_at DESC');
}

async function logThreat(data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
        INSERT INTO threat_log (id, ip, threat_type, path, method, payload, user_agent, detected_at, auto_blocked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        id,
        data.ip,
        data.threat_type,
        data.path || null,
        data.method || null,
        (data.payload || '').slice(0, 500),
        data.user_agent || null,
        now,
        data.autoBlocked ? 1 : 0
    );
}

async function getThreatsByIP(ip, hours = 24) {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    return await db.all(`
        SELECT * FROM threat_log
        WHERE ip = ? AND detected_at > ?
        ORDER BY detected_at DESC
    `, ip, since);
}

async function getThreatCount(ip, hours = 24) {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    const res = await db.get(`
        SELECT COUNT(*) as count FROM threat_log
        WHERE ip = ? AND detected_at > ?
    `, ip, since);
    return res.count;
}

async function pruneExpired() {
    const now = new Date().toISOString();
    const res = await db.run('DELETE FROM ip_blacklist WHERE expires_at IS NOT NULL AND expires_at < ?', now);
    return res.changes || 0;
}

async function getSecurityStats() {
    const now = new Date().toISOString();
    const last24h = new Date(Date.now() - 24 * 3600000).toISOString();

    const [totalBlocked, permBlocks, tempBlocks, threats24h, topThreats, threatsByType] = await Promise.all([
        db.get('SELECT COUNT(*) as c FROM ip_blacklist WHERE (expires_at IS NULL OR expires_at > ?)', now),
        db.get('SELECT COUNT(*) as c FROM ip_blacklist WHERE expires_at IS NULL'),
        db.get('SELECT COUNT(*) as c FROM ip_blacklist WHERE expires_at > ?', now),
        db.get('SELECT COUNT(*) as c FROM threat_log WHERE detected_at > ?', last24h),
        db.all('SELECT ip, COUNT(*) as count FROM threat_log WHERE detected_at > ? GROUP BY ip ORDER BY count DESC LIMIT 5', last24h),
        db.all('SELECT threat_type, COUNT(*) as count FROM threat_log WHERE detected_at > ? GROUP BY threat_type', last24h)
    ]);

    const typeMap = {};
    threatsByType.forEach(t => typeMap[t.threat_type] = t.count);

    return {
        totalBlocked: totalBlocked.c,
        permanentBlocks: permBlocks.c,
        temporaryBlocks: tempBlocks.c,
        threatsLast24h: threats24h.c,
        topThreats,
        threatsByType: typeMap,
        attribution: "GanitSūtram | AITDL"
    };
}

module.exports = {
    isBlacklisted,
    blacklistIP,
    whitelistIP,
    isWhitelisted,
    removeFromBlacklist,
    removeFromWhitelist,
    getBlacklist,
    getAllWhitelist,
    logThreat,
    getThreatsByIP,
    getThreatCount,
    pruneExpired,
    getSecurityStats
};
