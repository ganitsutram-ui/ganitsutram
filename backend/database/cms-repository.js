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
 * Gregorian: 2026-03-08
 * 
 * Purpose: Data access layer for CMS.
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function createContent(data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const query = `
        INSERT INTO cms_content (
            content_id, content_type, slug, 
            title_en, title_hi, title_sa, 
            body_en, body_hi, body_sa, 
            excerpt_en, excerpt_hi, excerpt_sa,
            icon, category, difficulty, tags,
            sort_order, published, featured, author_id,
            created_at, updated_at
        ) VALUES (
            ?, ?, ?, 
            ?, ?, ?, 
            ?, ?, ?, 
            ?, ?, ?, 
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?
        ) RETURNING *
    `;

    const params = [
        id, data.content_type, data.slug,
        data.title_en, data.title_hi || null, data.title_sa || null,
        data.body_en, data.body_hi || null, data.body_sa || null,
        data.excerpt_en || null, data.excerpt_hi || null, data.excerpt_sa || null,
        data.icon || null, data.category || null, data.difficulty || null, data.tags || null,
        data.sort_order || 0, data.published || 0, data.featured || 0, data.author_id,
        now, now
    ];

    return await db.run(query, ...params);
}

async function updateContent(id, changes) {
    const now = new Date().toISOString();
    const fields = Object.keys(changes);
    const sets = fields.map(f => `${f} = ?`);
    sets.push('updated_at = ?');

    const query = `UPDATE cms_content SET ${sets.join(', ')} WHERE content_id = ? RETURNING *`;
    const params = [...fields.map(f => changes[f]), now, id];

    return await db.run(query, ...params);
}

async function publishContent(id) {
    const now = new Date().toISOString();
    return await db.run(
        'UPDATE cms_content SET published = 1, published_at = ?, updated_at = ? WHERE content_id = ? RETURNING *',
        now, now, id
    );
}

async function getContentBySlug(slug) {
    return await db.get('SELECT * FROM cms_content WHERE slug = ?', slug);
}

async function getAllContent(options = {}) {
    let query = 'SELECT * FROM cms_content';
    const params = [];
    const wheres = [];

    return await db.all(query, ...params);
}

module.exports = {
    createContent,
    updateContent,
    publishContent,
    getContentBySlug,
    getAllContent
};
