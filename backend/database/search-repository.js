/**
 * Search Repository
 * Handles cross-entity searching across discoveries, CMS content, and graph nodes.
 * Supports both SQLite and PostgreSQL via the unified DB adapter.
 */
const db = require('./db');

class SearchRepository {
    async search(query, type = null) {
        // Normalize query for case-insensitive search
        const searchTerm = `%${query.toLowerCase()}%`;
        let results = [];
        
        console.log(`[Search] Query: "${query}", Type: ${type}, DB: ${db.type}`);

        // 1. Search Discoveries
        if (!type || type === 'discovery') {
            const sql = `
                SELECT 'discovery' as doc_type, slug as doc_id, slug, title, description as excerpt, category
                FROM discoveries
                WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(long_desc) LIKE ? OR LOWER(sutra) LIKE ?
                LIMIT 10
            `;
            try {
                const discoveries = await db.all(sql, searchTerm, searchTerm, searchTerm, searchTerm);
                results = results.concat(discoveries);
            } catch (err) {
                console.error('[Search] Error searching discoveries:', err.message);
            }
        }

        // 2. Search CMS Content (Concepts, Sutras, Articles, Lessons)
        // We include all content types if no specific type is requested
        if (!type || ['concept', 'sutra', 'article', 'lesson'].includes(type)) {
            const sql = `
                SELECT content_type as doc_type, slug as doc_id, slug, title_en as title, excerpt_en as excerpt, category
                FROM cms_content
                WHERE (LOWER(title_en) LIKE ? OR LOWER(body_en) LIKE ? OR LOWER(excerpt_en) LIKE ?)
                ${type ? `AND content_type = ?` : ''}
                LIMIT 10
            `;
            const params = type ? [searchTerm, searchTerm, searchTerm, type] : [searchTerm, searchTerm, searchTerm];
            try {
                const cmsResults = await db.all(sql, ...params);
                results = results.concat(cmsResults);
            } catch (err) {
                console.error('[Search] Error searching CMS content:', err.message);
            }
        }

        // 3. Search Graph Nodes
        if (!type || type === 'node') {
            const sql = `
                SELECT 'node' as doc_type, node_id as doc_id, node_id as slug, label as title, category, description as excerpt
                FROM graph_nodes
                WHERE LOWER(label) LIKE ? OR LOWER(description) LIKE ?
                LIMIT 10
            `;
            try {
                const nodes = await db.all(sql, searchTerm, searchTerm);
                results = results.concat(nodes);
            } catch (err) {
                console.error('[Search] Error searching graph nodes:', err.message);
            }
        }

        console.log(`[Search] Found ${results.length} results.`);
        return results;
    }

    async getPopular() {
        return [
            { query: 'digital root' },
            { query: 'nikhilam' },
            { query: 'fibonacci' },
            { query: 'vedic' }
        ];
    }

    async getTrending() {
        return [
            { query: 'kaprekar' },
            { query: 'urdhva' },
            { query: 'digital root cycle' }
        ];
    }
}

module.exports = new SearchRepository();
