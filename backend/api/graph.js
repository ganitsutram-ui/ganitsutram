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
 * Purpose: API routes for the Knowledge Graph.
 */

const express = require('express');
const router = express.Router();
const graphRepo = require('../database/graph-repository');

/**
 * GET /api/graph
 * Returns the entire knowledge graph (nodes and links).
 */
router.get('/', async (req, res) => {
    try {
        const data = await graphRepo.getGraphData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch graph data" });
    }
});

/**
 * GET /api/graph/node/:id
 * Returns details for a single node.
 */
router.get('/node/:id', async (req, res) => {
    try {
        const node = await graphRepo.getNodeById(req.params.id);
        if (!node) return res.status(404).json({ error: "Node not found" });
        res.json(node);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch node details" });
    }
});

module.exports = router;
