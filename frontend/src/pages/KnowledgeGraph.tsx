import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { GlassCard } from '../components/GlassCard';
import { Network, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { UniversalSearchResult } from '../types';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isDragging?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export const KnowledgeGraph: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Selection / Interaction states
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  const fetchGraphData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ nodes: any[]; links: any[] }>('/graph');
      const rawNodes = response.data.nodes;
      const rawLinks = response.data.links;

      // Initialize coordinates randomly in center area
      const canvas = canvasRef.current;
      const width = canvas ? canvas.width : 800;
      const height = canvas ? canvas.height : 500;
      const initializedNodes = rawNodes.map((n: any) => ({
        ...n,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        radius: n.type === 'note' ? 8 : n.type === 'document' ? 7 : 6
      }));

      setNodes(initializedNodes);
      setLinks(rawLinks);
    } catch (err: any) {
      setError('Failed to load knowledge graph.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Set up and run the physics rendering loop
  useEffect(() => {
    if (nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const runPhysicsAndRender = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Force calculations (Coulomb repulsion & Hooke attraction)
      const kRepel = 400; // Repulsion strength
      const kAttract = 0.04; // Spring stiffness
      const dMin = 40; // Minimum distance threshold
      const gravity = 0.02; // Gravity pulling nodes to center

      // Apply repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) || 1;

          if (dist < 300) {
            const force = kRepel / (distSq + dMin);
            const fx = force * (dx / dist);
            const fy = force * (dy / dist);

            if (!nodeA.isDragging) {
              nodeA.vx -= fx;
              nodeA.vy -= fy;
            }
            if (!nodeB.isDragging) {
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          }
        }
      }

      // Apply attraction forces along link lines
      for (const link of links) {
        const nodeA = nodes.find(n => n.id === link.source);
        const nodeB = nodes.find(n => n.id === link.target);
        if (nodeA && nodeB) {
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 100) * kAttract; // Rest length = 100
          const fx = force * (dx / dist);
          const fy = force * (dy / dist);

          if (!nodeA.isDragging) {
            nodeA.vx += fx;
            nodeA.vy += fy;
          }
          if (!nodeB.isDragging) {
            nodeB.vx -= fx;
            nodeB.vy -= fy;
          }
        }
      }

      // Apply gravity to center & update positions
      const cx = width / 2;
      const cy = height / 2;
      for (const node of nodes) {
        if (node.isDragging) continue;

        // Pull to center
        node.vx += (cx - node.x) * gravity;
        node.vy += (cy - node.y) * gravity;

        // Apply velocities with damping friction (0.85)
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.85;
        node.vy *= 0.85;

        // Boundary bounds
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));
      }

      // 2. Rendering
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Apply pan & zoom transforms
      ctx.translate(cx + panOffset.x, cy + panOffset.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);

      // Check dark mode state for dynamic theme coloring
      const isDark = document.documentElement.classList.contains('dark');

      // Draw Links (lines)
      ctx.lineWidth = isDark ? 1 : 1.5;
      for (const link of links) {
        const nodeA = nodes.find(n => n.id === link.source);
        const nodeB = nodes.find(n => n.id === link.target);
        if (nodeA && nodeB) {
          ctx.strokeStyle = link.type === 'shared_tag' 
            ? (isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(147, 51, 234, 0.55)') 
            : (isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(8, 145, 178, 0.55)');
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      }

      // Draw Nodes (circles)
      for (const node of nodes) {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (isHovered ? 1.25 : 1), 0, 2 * Math.PI);
        
        // Node color mapping by type
        let color = '#a855f7'; // note: purple
        if (node.type === 'document') color = '#06b6d4'; // document: cyan
        else if (node.type === 'event') color = '#f59e0b'; // event: amber
        else if (node.type === 'task') color = '#ef4444'; // task: red
        else if (node.type === 'goal') color = '#10b981'; // goal: emerald
        else if (node.type === 'learning') color = '#3b82f6'; // learning: blue

        ctx.fillStyle = color;
        ctx.fill();

        // Border overlay adaptivity
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = isSelected 
          ? (isDark ? '#ffffff' : '#0f172a') 
          : (isHovered ? color : (isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(15, 23, 42, 0.3)'));
        ctx.shadowBlur = isHovered ? 12 : 0;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Label details on node hover or select - high contrast text in light mode
        if (isHovered || isSelected || nodes.length < 15) {
          ctx.fillStyle = isSelected 
            ? (isDark ? '#ffffff' : '#0f172a') 
            : (isDark ? 'rgba(255, 255, 255, 0.9)' : '#1e293b');
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y - node.radius - 6);
        }
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(runPhysicsAndRender);
    };

    runPhysicsAndRender();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, links, hoveredNode, selectedNode, zoom, panOffset]);

  // Adjust canvas size to parent container
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = 500;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Interactivity handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert screen mouse coordinates into pan/zoom transformed world coordinates
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const worldX = ((x - cx - panOffset.x) / zoom) + cx;
    const worldY = ((y - cy - panOffset.y) / zoom) + cy;

    // Clicked node?
    const clickedNode = nodes.find(n => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) < n.radius + 8;
    });

    if (clickedNode) {
      clickedNode.isDragging = true;
      setDraggedNode(clickedNode);
      setSelectedNode(clickedNode);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to world coordinates
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const worldX = ((x - cx - panOffset.x) / zoom) + cx;
    const worldY = ((y - cy - panOffset.y) / zoom) + cy;

    if (draggedNode) {
      draggedNode.x = worldX;
      draggedNode.y = worldY;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else {
      // Hover detection
      const hovered = nodes.find(n => {
        const dx = n.x - worldX;
        const dy = n.y - worldY;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 8;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      draggedNode.isDragging = false;
      setDraggedNode(null);
    }
    setIsPanning(false);
  };

  // Zoom utilities
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.15, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const resetLayout = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    fetchGraphData();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <Network className="text-purple-500 dark:text-purple-400" size={24} /> Knowledge Brain Graph
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual map of connections inside your second brain. Drag nodes, adjust zoom, and explore context networks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas container */}
        <div ref={containerRef} className="lg:col-span-3 relative">
          <GlassCard className="p-2 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm z-10">
                <RefreshCw size={24} className="text-purple-500 animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="block cursor-grab active:cursor-grabbing w-full"
            />

            {/* Bottom floating graph actions bar */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={zoomIn}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={resetLayout}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Reset View"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Selected node detail sidecard info */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-5 flex-1">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Node Metadata</h3>
            
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Type</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-purple-400 capitalize">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Title / Filename</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block mt-1 leading-snug">{selectedNode.label}</span>
                </div>
                {selectedNode.category && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Category</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 mt-1 inline-block font-semibold uppercase">
                      {selectedNode.category}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-12 text-center">Click a node on the map to inspect its connections and properties.</p>
            )}
          </GlassCard>

          {/* Color legends guide card */}
          <GlassCard className="p-5">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Legends Map</h3>
            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-650 dark:text-slate-400 font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Events</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Learning</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
