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
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 */
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Purpose: Repository for Knowledge Graph data.
 */

const db = require('./db');

/**
 * Retrieves all nodes and edges for the knowledge graph.
 */
async function getGraphData() {
    const nodes = await db.all('SELECT * FROM graph_nodes');
    const edges = await db.all('SELECT * FROM graph_edges');
    
    // Parse metadata if it exists
    const parsedNodes = nodes.map(node => ({
        ...node,
        metadata: node.metadata ? JSON.parse(node.metadata) : null
    }));

    return {
        nodes: parsedNodes,
        links: edges // D3 uses 'links' typically
    };
}

/**
 * Retrieves a single node by ID.
 */
async function getNodeById(nodeId) {
    const node = await db.get('SELECT * FROM graph_nodes WHERE node_id = ?', nodeId);
    if (node && node.metadata) {
        node.metadata = JSON.parse(node.metadata);
    }
    return node;
}

/**
 * Retrieves neighbors of a node.
 */
async function getNeighbors(nodeId) {
    const edges = await db.all(`
        SELECT * FROM graph_edges 
        WHERE source_id = ? OR target_id = ?
    `, [nodeId, nodeId]);
    
    return edges;
}

module.exports = {
    getGraphData,
    getNodeById,
    getNeighbors
};
