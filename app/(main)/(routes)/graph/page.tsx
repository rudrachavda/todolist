"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import * as d3 from "d3-force";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const GraphPage = () => {
    const { user } = useUser();
    const { resolvedTheme } = useTheme();
    const documents = useQuery(api.documents.getSearch);

    const graphContainerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(null);

    const afkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // We use this to track if we've done the initial zoom-out
    const [isInitialized, setIsInitialized] = useState(false);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoverNode, setHoverNode] = useState<any>(null);
    const [colorsLoaded, setColorsLoaded] = useState(false);
    
    const [themeColors, setThemeColors] = useState({
        background: '#1a1a1a',
        foreground: '#ffffff',
        primary: '#A32100',
        secondary: '#cccccc'
    });

    useEffect(() => {
        const updateDimensions = () => {
            if (graphContainerRef.current) {
                setDimensions({
                    width: graphContainerRef.current.offsetWidth,
                    height: graphContainerRef.current.offsetHeight,
                });
            }
        };
        
        updateDimensions();

        const container = graphContainerRef.current;
        let resizeObserver: ResizeObserver | null = null;
        
        if (container) {
            resizeObserver = new ResizeObserver(() => {
                updateDimensions();
            });
            resizeObserver.observe(container);
        }

        const updateThemeColors = () => {
            const style = getComputedStyle(document.body);
            setThemeColors({
                background: style.getPropertyValue('--background').trim() || '#1a1a1a',
                foreground: style.getPropertyValue('--foreground').trim() || '#ffffff',
                primary: style.getPropertyValue('--primary').trim() || '#A32100',
                secondary: style.getPropertyValue('--muted-foreground').trim() || '#888888'
            });
            setColorsLoaded(true);
        };

        const timeoutId = setTimeout(updateThemeColors, 50);

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            clearTimeout(timeoutId);
            // Clear AFK timer on unmount
            if (afkTimeoutRef.current) clearTimeout(afkTimeoutRef.current);
        }
    }, [resolvedTheme]);

    // --- FIX: KEEP CAMERA CENTERED ON RESIZE ---
    // Since the cluster is now at (0,0), we ensure the camera always looks at (0,0)
    // when the screen dimensions change.
    useEffect(() => {
        if (fgRef.current && dimensions.width > 0 && dimensions.height > 0) {
            // centerAt(x, y, transition_ms)
            // We use a small transition (200ms) to smooth out the resize snapping
            fgRef.current.centerAt(0, 0, 200);
        }
    }, [dimensions]);

    const data = useMemo(() => ({
        nodes: documents?.map((d: any) => ({ id: d._id, name: d.title, val: 1 })) || [],
        links: documents?.filter((d: any) => d.parentDocument).map((d: any) => ({ source: d.parentDocument, target: d._id })) || [],
    }), [documents]);

    // --- PHYSICS ENGINE TUNING ---
    useEffect(() => {
        if (fgRef.current && dimensions.width > 0) {
            const fg = fgRef.current;

            fg.d3Force('center', null);

            // --- FIX: UNIVERSAL CENTER (0,0) ---
            // Instead of using dimensions.width/2, we set the center to (0,0).
            // This means the cluster stays at the mathematical origin regardless of screen size.
            fg.d3Force('radial', d3.forceRadial(0, 0, 0).strength(0.15));

            fg.d3Force('charge').strength(-40).distanceMax(150);
            fg.d3Force('link').distance(30).strength(0.5);
            fg.d3Force('collide', d3.forceCollide(10).strength(1));

            fg.d3ReheatSimulation();
        }
    }, [documents, dimensions]); // Dimensions dependency is okay here to ensure init

    // --- INITIAL ZOOM HANDLER ---
    useEffect(() => {
        if (fgRef.current && data.nodes.length > 0 && !isInitialized && dimensions.width > 0) {
            setTimeout(() => {
                // <--- CHANGE THIS: DEFAULT ZOOM (ON LOAD)
                fgRef.current.zoomToFit(1000, 300); 
                setIsInitialized(true);
            }, 200);
        }
    }, [data, dimensions, isInitialized]);

    // --- NEW: AFK AUTO-CENTER LOGIC ---
    const resetAfkTimer = useCallback(() => {
        // 1. Clear any existing timer
        if (afkTimeoutRef.current) {
            clearTimeout(afkTimeoutRef.current);
        }

        // 2. Start a new 3-second timer
        afkTimeoutRef.current = setTimeout(() => {
            if (fgRef.current) {
                // Smoothly pan back to (0,0) over 1 second
                fgRef.current.centerAt(0, 0, 1000);
            }
        }, 1500); 
    }, []);

    useEffect(() => {
        resetAfkTimer();
    }, [resetAfkTimer]);

    const getNodeId = useCallback((node: any) => (typeof node === 'object' ? node.id : node), []);

    const isLinkConnected = useCallback((link: any, hoveredId: string) => {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        return sourceId === hoveredId || targetId === hoveredId;
    }, [getNodeId]);

    const isNodeConnected = useCallback((node: any, hoveredId: string) => {
        if (getNodeId(node) === hoveredId) return true;
        return data.links.some((link: any) => isLinkConnected(link, hoveredId) && (getNodeId(link.source) === getNodeId(node) || getNodeId(link.target) === getNodeId(node)));
    }, [data.links, isLinkConnected, getNodeId]);

    const handleNodeClick = useCallback((node: any) => {
        resetAfkTimer(); // Reset timer on click
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(2.5, 1000);
    }, [resetAfkTimer]);

    return (
        <div className="h-full relative flex flex-col overflow-hidden bg-background text-foreground">
            <nav className="z-10 w-full bg-transparent/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-center absolute top-0">
                <h2 className="text-sm font-semibold opacity-80">
                    {user?.firstName ? `${user.firstName}'s Graph` : 'Graph View'}
                </h2>
            </nav>

            <div ref={graphContainerRef} className="flex-grow relative w-full h-full">
                {colorsLoaded && dimensions.width > 0 && (
                    <ForceGraph2D
                        ref={fgRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={data}
                        backgroundColor={resolvedTheme === 'dark' ? '#191919' : themeColors.background}
                        nodeLabel=""
                        nodeRelSize={6}
                        
                        // <--- CHANGE THIS: ZOOM LIMITS
                        minZoom={1} 
                        maxZoom={4}   
                        
                        cooldownTicks={100} 
                        d3VelocityDecay={0.4} 
                        
                        

                        // Reset timer on ANY interaction
                        onNodeHover={setHoverNode}
                        onNodeClick={handleNodeClick}
                        onNodeDrag={resetAfkTimer}
                        onNodeDragEnd={(node) => {
                            resetAfkTimer();
                            if (node) {
                                node.fx = undefined;
                                node.fy = undefined;
                            }
                        }}
                        onBackgroundClick={resetAfkTimer}
                        onZoom={resetAfkTimer}

                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.name;
                            // <--- CHANGE THIS: TEXT SIZE
                            const fontSize = 12 / globalScale;
                            
                            const isHovered = hoverNode && getNodeId(node) === getNodeId(hoverNode);
                            const isNeighbor = hoverNode && isNodeConnected(node, getNodeId(hoverNode));
                            const shouldDim = hoverNode && !isHovered && !isNeighbor;
                            
                            ctx.save();
                            if (shouldDim) ctx.globalAlpha = 0.2;

                            // <--- CHANGE THIS: NODE SIZE
                            const nodeSize = isHovered ? 5 : 4;
                            
                            ctx.beginPath();
                            ctx.arc(node.x ?? 0, node.y ?? 0, nodeSize, 0, 2 * Math.PI, false);
                            
                            // <--- CHANGE THIS: NODE COLOR
                            ctx.fillStyle = isHovered || isNeighbor ? themeColors.primary : themeColors.foreground;
                            
                            if (isHovered) {
                                // <--- CHANGE THIS: GLOW/SHADOW
                                ctx.shadowColor = themeColors.primary;
                                ctx.shadowBlur = 0; 
                            }
                            ctx.fill();

                            if (globalScale > 1.5 || isHovered || isNeighbor) {
                                ctx.font = `${isHovered ? 'bold' : 'normal'} ${fontSize}px Sans-Serif`;
                                ctx.fillStyle = isHovered ? themeColors.primary : themeColors.secondary;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';
                                ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + (nodeSize + 2));
                            }
                            ctx.restore();
                        }}

                        linkCanvasObject={(link: any, ctx, globalScale) => {
                            const hoveredId = hoverNode ? getNodeId(hoverNode) : null;
                            const isConnected = hoveredId && isLinkConnected(link, hoveredId);
                            const shouldDim = hoverNode && !isConnected;

                            if (shouldDim) return;

                            ctx.save();
                            
                            // <--- CHANGE THIS: LINE COLOR
                            ctx.strokeStyle = isConnected ? themeColors.primary : themeColors.foreground;
                            
                            // <--- CHANGE THIS: LINE WIDTH
                            ctx.lineWidth = isConnected ? 2 / globalScale : 1 / globalScale;
                            
                            ctx.globalAlpha = isConnected ? 0.8 : 0.2;
                            
                            ctx.beginPath();
                            ctx.moveTo(link.source.x ?? 0, link.source.y ?? 0);
                            ctx.lineTo(link.target.x ?? 0, link.target.y ?? 0);
                            ctx.stroke();
                            ctx.restore();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default GraphPage;