/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Business logic for CMS.
 */

const repo = require('../database/cms-repository');
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const VALID_TYPES = ['discovery', 'lesson', 'sutra', 'concept', 'announcement'];

/**
 * Validates and creates content.
 */
async function createContent(authorId, data) {
    if (!data.title_en || !data.body_en) {
        throw new Error('Title (English) and Body (English) are required.');
    }
    if (!VALID_TYPES.includes(data.content_type)) {
        throw new Error(`Invalid content type. Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    if (!data.slug) {
        data.slug = generateSlug(data.title_en);
    } else {
        data.slug = sanitizeSlug(data.slug);
    }

    // Ensure slug uniqueness
    data.slug = await ensureUniqueSlug(data.slug);
    data.author_id = authorId;

    return await repo.createContent(data);
}

/**
 * Updates content with validation.
 */
async function updateContent(contentId, authorId, changes) {
    if (changes.slug) {
        changes.slug = await ensureUniqueSlug(sanitizeSlug(changes.slug), contentId);
    }
    changes.author_id = authorId;
    return await repo.updateContent(contentId, changes);
}

/**
 * Publishes content if user is admin.
 */
async function publishContent(contentId, adminId) {
    const user = await db.get('SELECT role FROM users WHERE user_id = ?', adminId);
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized. Admin role required.');
    }
    return await repo.publishContent(contentId);
}

async function getPublishedContent(type, options = {}, locale = 'en') {
    const content = await repo.getAllContent({
        ...options,
        type,
        published: true
    });

    return content.map(row => ({
        ...row,
        title: row[`title_${locale}`] || row.title_en,
        body: row[`body_${locale}`] || row.body_en,
        excerpt: row[`excerpt_${locale}`] || row.excerpt_en
    }));
}

async function getContentForAdmin(type, options = {}) {
    return await repo.getAllContent({ ...options, type });
}

/**
 * Syncs legacy discoveries to CMS.
 */
async function syncDiscoveriesToCMS() {
    const discoveries = await db.all('SELECT * FROM discoveries');
    let synced = 0;

    for (const d of discoveries) {
        const existing = await repo.getContentBySlug(d.slug);
        if (!existing) {
            await repo.createContent({
                content_type: 'discovery',
                slug: d.slug,
                title_en: d.title,
                body_en: d.long_desc || d.description,
                excerpt_en: d.description,
                icon: d.icon,
                category: d.category,
                difficulty: d.difficulty,
                sort_order: d.sort_order,
                published: 1,
                author_id: null,
                created_at: d.created_at,
                updated_at: d.created_at
            });
            synced++;
        }
    }

    return synced;
}

/**
 * Slug generation: lowercases, replaces spaces with hyphens, strips special chars.
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Strip special chars
        .replace(/\s+/g, '-')     // Spaces to hyphens
        .replace(/-+/g, '-')      // Collapse hyphens
        .trim();
}

function sanitizeSlug(slug) {
    return slug
        .toLowerCase()
        .replace(/[^\w-]/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function ensureUniqueSlug(slug, excludeId = null) {
    let finalSlug = slug;
    let counter = 1;

    while (true) {
        const existing = await db.get('SELECT content_id FROM cms_content WHERE slug = ?', finalSlug);
        if (!existing || (excludeId && existing.content_id === excludeId)) {
            break;
        }
        finalSlug = `${slug}-${++counter}`;
    }
    return finalSlug;
}

module.exports = {
    createContent,
    updateContent,
    publishContent,
    getPublishedContent,
    getContentForAdmin,
    syncDiscoveriesToCMS,
    generateSlug
};
