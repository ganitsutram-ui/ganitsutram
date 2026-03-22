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
 * Purpose: Repository for user badges.
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function getUserBadges(userId) {
    return await db.all(`
        SELECT * FROM user_badges
        WHERE user_id = ?
        ORDER BY earned_at DESC
    `, userId);
}

async function hasAwardedBadge(userId, badgeId) {
    const row = await db.get(`SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?`, userId, badgeId);
    return !!row;
}

async function awardBadge(userId, badgeId) {
    const exists = await hasAwardedBadge(userId, badgeId);
    if (exists) return false;

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
        INSERT INTO user_badges (user_badge_id, user_id, badge_id, earned_at)
        VALUES (?, ?, ?, ?)
    `, id, userId, badgeId, now);

    return true;
}

module.exports = {
    getUserBadges,
    hasAwardedBadge,
    awardBadge
};
