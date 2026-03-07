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
function createContent(authorId, data) {
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
    data.slug = ensureUniqueSlug(data.slug);
    data.author_id = authorId;

    return repo.createContent(data);
}

/**
 * Updates content with validation.
 */
function updateContent(contentId, authorId, changes) {
    if (changes.slug) {
        changes.slug = ensureUniqueSlug(sanitizeSlug(changes.slug), contentId);
    }
    changes.author_id = authorId;
    return repo.updateContent(contentId, changes);
}

/**
 * Publishes content if user is admin.
 */
function publishContent(contentId, adminId) {
    const user = db.prepare('SELECT role FROM users WHERE user_id = ?').get(adminId);
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized. Admin role required.');
    }
    return repo.publishContent(contentId);
}

function getPublishedContent(type, options = {}, locale = 'en') {
    return repo.getAllContent({
        ...options,
        type,
        published: true
    }).map(row => ({
        ...row,
        title: row[`title_${locale}`] || row.title_en,
        body: row[`body_${locale}`] || row.body_en,
        excerpt: row[`excerpt_${locale}`] || row.excerpt_en
    }));
}

function getContentForAdmin(type, options = {}) {
    return repo.getAllContent({ ...options, type });
}

/**
 * Syncs legacy discoveries to CMS.
 */
function syncDiscoveriesToCMS() {
    const discoveries = db.prepare('SELECT * FROM discoveries').all();
    let synced = 0;

    discoveries.forEach(d => {
        const existing = repo.getContentBySlug(d.slug);
        if (!existing) {
            repo.createContent({
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
    });

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

function ensureUniqueSlug(slug, excludeId = null) {
    let finalSlug = slug;
    let counter = 1;

    while (true) {
        const existing = db.prepare('SELECT content_id FROM cms_content WHERE slug = ?').get(finalSlug);
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
