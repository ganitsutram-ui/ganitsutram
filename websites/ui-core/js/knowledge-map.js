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
/*
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: Knowledge Map — API-driven interactive D3 graph.
 *          Fetches /api/graph for nodes + edges.
 *          Supports focus mode, path finder, and graph search.
 */

(function () {
    'use strict';

    const { API_BASE } = window.GanitConfig;
    const GRAPH_API = `${API_BASE.replace('/api', '')}/api/graph`;

    // Node type → colour mapping
    const typeColors = {
        operation: '#ff5500',
        concept: '#ffb300',
        sutra: '#7c3aed',
        domain: '#0ea5e9',
        persona: '#22c55e',
        pattern: '#ec4899',
        discovery: '#f97316'
    };

    function nodeColor(d) { return typeColors[d.type] || 'rgba(255,255,255,0.3)'; }

    let allNodes = [], allLinks = [], simulation, nodeSelection, linkSelection, labelSelection;
    let svgRoot, container;

    // ─── INIT ────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', async () => {
        await loadGraphFromAPI();
        initPanelListeners();
        initPathFinder();
        initGraphSearch();
    });

    async function loadGraphFromAPI() {
        const wrapper = document.getElementById('knowledge-graph');
        if (!wrapper) return;

        const locale = localStorage.getItem('gs_locale') || 'en';
        try {
            const resp = await fetch(`${GRAPH_API}?locale=${locale}`);
            if (!resp.ok) throw new Error('Graph API error');
            const data = await resp.json();
            allNodes = data.nodes;
            allLinks = data.edges;
            initGraph(allNodes, allLinks);
        } catch (e) {
            wrapper.innerHTML = `<div style="color:rgba(255,255,255,0.4);padding:40px;text-align:center">
                Failed to load knowledge graph. Please refresh.
            </div>`;
        }
    }

    function initGraph(nodes, links) {
        const wrapper = document.getElementById('knowledge-graph');
        if (!wrapper) return;

        const width = wrapper.clientWidth || 900;
        const height = wrapper.clientHeight || 600;

        svgRoot = d3.select('#knowledge-graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('aria-label', 'Knowledge Graph');

        svgRoot.call(
            d3.zoom().scaleExtent([0.2, 4]).on('zoom', (event) => {
                container.attr('transform', event.transform);
            })
        );

        container = svgRoot.append('g');

        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const uniqueNodes = [...nodeMap.values()];

        simulation = d3.forceSimulation(uniqueNodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(d => 120 + (d.weight || 1) * 20))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide(30));

        linkSelection = container.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'gs-link')
            .attr('stroke', 'rgba(255,255,255,0.12)')
            .attr('stroke-width', d => Math.sqrt(d.weight || 1));

        nodeSelection = container.append('g')
            .selectAll('circle')
            .data(uniqueNodes)
            .enter().append('circle')
            .attr('class', 'gs-node')
            .attr('r', d => 16 + (d.weight || 1) * 2)
            .attr('fill', d => nodeColor(d))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.9)
            .style('cursor', 'pointer')
            .call(drag(simulation))
            .on('click', handleNodeClick)
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);

        labelSelection = container.append('g')
            .selectAll('text')
            .data(uniqueNodes)
            .enter().append('text')
            .attr('class', 'gs-node-label')
            .attr('dx', 22)
            .attr('dy', 4)
            .attr('font-size', '11px')
            .attr('fill', 'rgba(255,255,255,0.75)')
            .text(d => d.label);

        simulation.on('tick', () => {
            linkSelection
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            nodeSelection.attr('cx', d => d.x).attr('cy', d => d.y);
            labelSelection.attr('x', d => d.x).attr('y', d => d.y);
        });
    }

    // ─── FOCUS MODE & NODE CLICK ───────────────────────────────────────

    async function handleNodeClick(event, d) {
        const locale = localStorage.getItem('gs_locale') || 'en';
        try {
            const resp = await fetch(`${GRAPH_API}/node/${d.id}?locale=${locale}`);
            const data = await resp.json();
            if (!resp.ok) return;

            const neighbourIds = new Set([d.id, ...(data.neighbours.nodes || []).map(n => n.id)]);

            nodeSelection
                .attr('opacity', nd => neighbourIds.has(nd.id) ? 1 : 0.15)
                .attr('stroke-width', nd => nd.id === d.id ? 3 : 1.5);

            linkSelection.attr('stroke', e => {
                const srcId = typeof e.source === 'object' ? e.source.id : e.source;
                const tgtId = typeof e.target === 'object' ? e.target.id : e.target;
                return (neighbourIds.has(srcId) && neighbourIds.has(tgtId))
                    ? 'rgba(255,179,0,0.6)' : 'rgba(255,255,255,0.05)';
            });

            showDetailPanel(data);
        } catch { /* silent */ }
    }

    function showDetailPanel(data) {
        const panel = document.getElementById('gs-detail-panel');
        if (!panel) return;

        const node = data.node;
        const color = typeColors[node.type] || '#fff';

        const typeBadge = document.getElementById('panel-badge');
        if (typeBadge) {
            typeBadge.textContent = node.type;
            typeBadge.style.color = color;
            typeBadge.style.borderColor = color;
        }
        const titleEl = document.getElementById('panel-title');
        if (titleEl) titleEl.textContent = node.label || node.id;

        const descEl = document.getElementById('panel-desc');
        if (descEl) {
            let html = `<p>${node.description || 'A node in the GanitSūtram knowledge graph.'}</p>`;
            if (data.related && data.related.length > 0) {
                html += `<p style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-top:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Related</p>`;
                html += data.related.map(r =>
                    `<span style="display:inline-block;margin:4px 4px 0 0;padding:3px 9px;background:rgba(255,255,255,0.05);border-radius:6px;font-size:0.78rem;color:rgba(255,255,255,0.65);cursor:pointer"
                     onclick="document.dispatchEvent(new CustomEvent('gs-focus-node',{detail:'${r.id}'}))">
                        ${r.icon || ''} ${r.label}
                     </span>`
                ).join('');
            }
            if (node.url) {
                html += `<br><a href="${node.url}" class="gs-button gs-button-primary" style="display:inline-block;margin-top:16px;font-size:0.8rem">
                    ${node.type === 'operation' ? 'Try in Solver →' : 'Explore →'}
                </a>`;
            }
            html += `<br><button onclick="window._startPathFrom && window._startPathFrom('${node.id}')"
                style="margin-top:8px;background:rgba(255,179,0,0.1);border:1px solid rgba(255,179,0,0.3);color:#ffb300;padding:5px 12px;border-radius:6px;font-size:0.78rem;cursor:pointer">
                🗺️ Find path from here
            </button>`;
            descEl.innerHTML = html;
        }

        panel.classList.add('active');
    }

    document.addEventListener('gs-focus-node', (e) => {
        if (e.detail) {
            const node = allNodes.find(n => n.id === e.detail);
            if (node) handleNodeClick(null, node);
        }
    });

    window._startPathFrom = function (nodeId) {
        const fromSelect = document.getElementById('gs-path-from');
        if (fromSelect) {
            fromSelect.value = nodeId;
            const finder = document.getElementById('gs-path-finder');
            if (finder) finder.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    function clearFocus() {
        if (nodeSelection) nodeSelection.attr('opacity', 0.9).attr('stroke-width', 1.5).attr('stroke', '#fff');
        if (linkSelection) linkSelection.attr('stroke', 'rgba(255,255,255,0.12)');
        const panel = document.getElementById('gs-detail-panel');
        if (panel) panel.classList.remove('active');
    }

    // ─── LEGEND UPDATE ────────────────────────────────────────────────

    function updateLegend() {
        const legend = document.querySelector('.gs-map-legend');
        if (!legend) return;
        const types = [...new Set(allNodes.map(n => n.type))];
        legend.innerHTML = types.map(t => `
            <div class="gs-legend-item">
                <span class="gs-dot" style="background:${typeColors[t] || '#fff'}"></span>
                ${t.charAt(0).toUpperCase() + t.slice(1)}
            </div>`).join('');
    }

    // ─── PANEL LISTENERS ──────────────────────────────────────────────

    function initPanelListeners() {
        const closeBtn = document.getElementById('panel-close');
        if (closeBtn) closeBtn.addEventListener('click', clearFocus);
    }

    // ─── TOOLTIP ──────────────────────────────────────────────────────

    const tooltip = document.getElementById('gs-map-tooltip');

    function handleMouseOver(event, d) {
        if (linkSelection) linkSelection.classed('highlighted', l => l.source.id === d.id || l.target.id === d.id);
        if (tooltip) {
            tooltip.style.opacity = '1';
            tooltip.innerHTML = `<span class="gs-tooltip-group" style="color:${nodeColor(d)}">${d.type}</span>${d.label}`;
        }
    }

    function handleMouseOut() {
        if (linkSelection) linkSelection.classed('highlighted', false);
        if (tooltip) tooltip.style.opacity = '0';
    }

    document.addEventListener('mousemove', (e) => {
        if (tooltip && tooltip.style.opacity === '1') {
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY + 15) + 'px';
        }
    });

    // ─── PATH FINDER ──────────────────────────────────────────────────

    function initPathFinder() {
        const finderEl = document.getElementById('gs-path-finder');
        if (!finderEl) return;

        const fromSel = document.getElementById('gs-path-from');
        const toSel = document.getElementById('gs-path-to');

        if (fromSel && toSel && allNodes.length > 0) {
            const opts = allNodes
                .filter(n => n.type !== 'persona')
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(n => `<option value="${n.id}">${n.label} (${n.type})</option>`)
                .join('');
            fromSel.innerHTML = `<option value="">From…</option>${opts}`;
            toSel.innerHTML = `<option value="">To…</option>${opts}`;
        }

        const btn = document.getElementById('gs-path-find-btn');
        if (btn) {
            btn.addEventListener('click', async () => {
                const from = fromSel?.value;
                const to = toSel?.value;
                if (!from || !to || from === to) return;
                await findPath(from, to);
            });
        }
    }

    async function findPath(from, to) {
        const resultEl = document.getElementById('gs-path-result');
        if (resultEl) resultEl.innerHTML = '<span style="color:rgba(255,255,255,0.4)">Finding…</span>';

        try {
            const resp = await fetch(`${GRAPH_API}/path?from=${from}&to=${to}`);
            const data = await resp.json();

            if (!resp.ok || !data.path) {
                if (resultEl) resultEl.innerHTML = '<span style="color:rgba(255,85,0,0.7)">No path found between these nodes.</span>';
                return;
            }

            const pathIds = new Set(data.path);
            const len = data.length;

            if (nodeSelection) {
                nodeSelection
                    .attr('opacity', d => pathIds.has(d.id) ? 1 : 0.15)
                    .attr('stroke', d => pathIds.has(d.id) ? '#ffb300' : '#fff')
                    .attr('stroke-width', d => pathIds.has(d.id) ? 3 : 1.5);
            }

            if (resultEl && data.nodes) {
                const steps = data.nodes.map(n => n.label).join(' → ');
                resultEl.innerHTML = `<span style="color:#ffb300;font-weight:600">${len} step${len !== 1 ? 's' : ''}</span>: ${steps}`;
            }
        } catch {
            if (resultEl) resultEl.innerHTML = '<span style="color:rgba(255,85,0,0.7)">Path finding failed.</span>';
        }
    }

    // ─── GRAPH SEARCH ─────────────────────────────────────────────────

    function initGraphSearch() {
        const searchInput = document.getElementById('gs-map-search');
        if (!searchInput) return;

        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            const q = searchInput.value.trim();
            if (!q) { clearFocus(); return; }
            debounce = setTimeout(() => highlightSearch(q), 300);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { searchInput.value = ''; clearFocus(); }
        });
    }

    async function highlightSearch(q) {
        if (!nodeSelection) return;
        try {
            const resp = await fetch(`${GRAPH_API}/search?q=${encodeURIComponent(q)}`);
            const data = await resp.json();
            const matchIds = new Set((data.nodes || []).map(n => n.id));
            if (matchIds.size === 0) return;
            nodeSelection.attr('opacity', d => matchIds.has(d.id) ? 1 : 0.1);
        } catch { /* silent */ }
    }

    // ─── DRAG ─────────────────────────────────────────────────────────

    function drag(sim) {
        return d3.drag()
            .on('start', (event) => {
                if (!event.active) sim.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            })
            .on('drag', (event) => {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            })
            .on('end', (event) => {
                if (!event.active) sim.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            });
    }

})();
