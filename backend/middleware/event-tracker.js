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
 * Purpose: Lightweight fire-and-forget analytics event tracker.
 */

const { v4: uuidv4 } = require('uuid');
const repo = require('../database/analytics-repository');

/**
 * Fire-and-forget event tracker. Non-blocking.
 * 
 * @param {string} eventType 
 * @param {Object} req - Express request object
 * @param {Object} metadata - Optional custom payload
 */
function trackEvent(eventType, req, metadata = {}) {
    setImmediate(async () => {
        try {
            const eventId = uuidv4();
            const userId = req?.user?.userId || null;
            // Handle session inference if available
            const sessionId = null; // Sticking to basic auth extraction for now

            const operation = metadata.operation || null;
            const metaStr = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null;

            let ipHint = null;
            if (req && req.ip) {
                const parts = req.ip.split('.');
                ipHint = parts.length >= 3 ? parts.slice(0, 3).join('.') : req.ip;
            }

            const userAgent = (req?.headers['user-agent'] || '').slice(0, 80);
            const createdAt = new Date().toISOString();

            await repo.insertEvent({
                eventId,
                eventType,
                userId,
                sessionId,
                operation,
                metadata: metaStr,
                ipHint,
                userAgent,
                createdAt
            });
        } catch (e) {
            console.error('[Analytics Error] Failed to track event:', e.message);
        }
    });
}

module.exports = { trackEvent };
