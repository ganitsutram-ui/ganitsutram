"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useI18n } from '@/context/I18nContext';

interface Node extends d3.SimulationNodeDatum {
    node_id: string;
    node_type: string;
    label: string;
    label_hi?: string;
    label_sa?: string;
    description?: string;
    category?: string;
    icon?: string;
    url?: string;
    weight?: number;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
    edge_id: string;
    source: string | Node;
    target: string | Node;
    edge_type: string;
    label?: string;
}

export default function KnowledgeMap() {
    const { locale, t } = useI18n();
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [graphData, setGraphData] = useState<{ nodes: Node[], links: Edge[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/graph`);
                const data = await res.json();
                setGraphData(data);
            } catch (err) {
                console.error("Failed to fetch graph:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGraph();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !graphData) return;
        
        const nodes = [...graphData.nodes];
        const links = [...graphData.links];
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);
        
        svg.selectAll("*").remove(); 

        const container = svg.append('g');

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 5])
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
            });

        svg.call(zoom);

        const simulation = d3.forceSimulation<Node>(nodes)
            .force('link', d3.forceLink<Node, Edge>(links).id(d => d.node_id).distance(120))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(50));

        const link = container.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'gs-link');

        const node = container.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'gs-node-group')
            .call(d3.drag<SVGGElement, Node>()
                .on('start', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on('drag', (e, d) => {
                    d.fx = e.x; d.fy = e.y;
                })
                .on('end', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0);
                    d.fx = null; d.fy = null;
                }))
            .on('click', (e, d) => {
                setSelectedNode(d);
            });

        node.append('circle')
            .attr('r', d => 12 + (d.weight || 1) * 3)
            .attr('class', 'gs-node')
            .attr('fill', d => {
                switch(d.category) {
                    case 'core': return '#ff5500';
                    case 'vedic': return '#ffb300';
                    case 'engine': return '#7c3aed';
                    case 'foundation': return 'rgba(255,255,255,0.3)';
                    case 'persona': return '#22c55e';
                    case 'pattern': return '#a855f7';
                    default: return '#999';
                }
            });

        node.append('text')
            .attr('dx', d => 18 + (d.weight || 1) * 3)
            .attr('dy', 4)
            .attr('class', 'gs-node-label')
            .text(d => locale === 'hi' ? (d.label_hi || d.label) : locale === 'sa' ? (d.label_sa || d.label) : d.label);

        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // Search filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            node.style('opacity', d => 
                d.label.toLowerCase().includes(query) || 
                d.node_id.toLowerCase().includes(query) ? 1 : 0.1
            );
            link.style('opacity', (d: any) => 
                d.source.label.toLowerCase().includes(query) || 
                d.target.label.toLowerCase().includes(query) ? 0.5 : 0.05
            );
        } else {
            node.style('opacity', 1);
            link.style('opacity', 1);
        }

        return () => { simulation.stop(); };
    }, [graphData, locale, searchQuery]);

    return (
        <main id="main-content">
            <div className="gs-container">
                <section className="gs-map-hero">
                    <div className="gs-sanskrit-line">सर्वं गणितमयम्</div>
                    <h1 className="gs-hero-title">Knowledge Map</h1>
                    <p className="gs-hero-sub">Explore the interconnected universe of mathematical concepts and Vedic wisdom.</p>
                </section>

                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="gs-search-input" 
                        placeholder="Search nodes… digital root, sutra…" 
                        style={{ width: '280px' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                        Click any node to explore • Drag to rearrange • Scroll to zoom
                    </span>
                </div>

                <div className="gs-map-legend">
                    <div className="gs-legend-item"><span className="gs-dot core"></span>Core</div>
                    <div className="gs-legend-item"><span className="gs-dot vedic"></span>Vedic</div>
                    <div className="gs-legend-item"><span className="gs-dot engine"></span>Engine</div>
                    <div className="gs-legend-item"><span className="gs-dot pattern"></span>Pattern</div>
                    <div className="gs-legend-item"><span className="gs-dot persona"></span>Persona</div>
                    <div className="gs-legend-item"><span className="gs-dot foundation"></span>Foundation</div>
                </div>

                <div className="gs-graph-wrapper" ref={containerRef}>
                    {isLoading && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
                            <div className="gs-spinner"></div>
                        </div>
                    )}
                    <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
                </div>
                
                <aside className={`gs-detail-panel ${selectedNode ? 'active' : ''}`}>
                    <button className="gs-panel-close" onClick={() => setSelectedNode(null)}>&times;</button>
                    {selectedNode && (
                        <>
                            <div className="gs-panel-badge" style={{ 
                                color: selectedNode.category === 'core' ? '#ff5500' : selectedNode.category === 'vedic' ? '#ffb300' : '#7c3aed' 
                            }}>
                                {selectedNode.node_type}
                            </div>
                            <h2 className="gs-panel-title">
                                {locale === 'hi' ? (selectedNode.label_hi || selectedNode.label) : locale === 'sa' ? (selectedNode.label_sa || selectedNode.label) : selectedNode.label}
                            </h2>
                            <p className="gs-panel-desc">{selectedNode.description || "No description available for this node."}</p>
                            
                            {selectedNode.url && (
                                <a href={selectedNode.url} className="gs-btn gs-btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                                    View Module
                                </a>
                            )}
                        </>
                    )}
                </aside>
            </div>
        </main>
    );
}
