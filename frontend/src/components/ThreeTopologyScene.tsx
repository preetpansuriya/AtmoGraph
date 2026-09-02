import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphNode, GraphEdge } from '../types/models';

interface ThreeTopologySceneProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  shockSourceId: string | null;
  shockIntensity: number;
  onSelectNode: (node: GraphNode) => void;
  isDark: boolean;
}

export const ThreeTopologyScene: React.FC<ThreeTopologySceneProps> = ({
  nodes,
  edges,
  selectedNodeId,
  shockSourceId,
  shockIntensity,
  onSelectNode,
  isDark,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tierFilter, setTierFilter] = useState<number | 'ALL'>('ALL');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const graphGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const pulseLinesRef = useRef<{ line: THREE.Line; material: THREE.LineBasicMaterial }[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 110);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(isDark ? 0x1e293b : 0xf8fafc, 2.5);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(isDark ? 0x38bdf8 : 0x0284c7, 3, 200);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);
    graphGroupRef.current = graphGroup;

    // 3D Orbital Grid Planes (Tier 1 Center, Tier 2 Mid, Tier 3 Outer)
    [25, 45, 65].forEach((radius, i) => {
      const ringGeo = new THREE.BufferGeometry();
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, (i - 1) * 8, Math.sin(theta) * radius));
      }
      ringGeo.setFromPoints(pts);
      const ringMat = new THREE.LineBasicMaterial({
        color: isDark ? 0x334155 : 0x94a3b8,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      graphGroup.add(ring);
    });

    // Node 3D Layout Calculation (Hierarchical Tier Cylindrical Orbit)
    const nodePositions = new Map<string, THREE.Vector3>();
    const nodeMap = new Map<string, THREE.Mesh>();

    const tierGroups: { [key: number]: GraphNode[] } = { 1: [], 2: [], 3: [] };
    nodes.forEach((n) => {
      const t = n.tier || 1;
      if (!tierGroups[t]) tierGroups[t] = [];
      tierGroups[t].push(n);
    });

    Object.keys(tierGroups).forEach((tierStr) => {
      const t = parseInt(tierStr);
      const list = tierGroups[t];
      const radius = t === 1 ? 22 : t === 2 ? 42 : 62;
      const yOffset = (t - 1) * -8;

      list.forEach((node, idx) => {
        const angle = (idx / list.length) * Math.PI * 2;
        const pos = new THREE.Vector3(
          Math.cos(angle) * radius,
          yOffset + (Math.sin(idx * 3) * 4),
          Math.sin(angle) * radius
        );
        nodePositions.set(node.node_id, pos);

        const isShock = node.node_id === shockSourceId;
        const isCritical = node.active_risk_level === 'Critical' || isShock;
        const isSelected = node.node_id === selectedNodeId;

        let nodeColor = isDark ? 0x38bdf8 : 0x0284c7;
        if (isCritical) nodeColor = 0xef4444;
        else if (node.active_risk_level === 'High') nodeColor = 0xf59e0b;
        else if (node.type === 'Fab') nodeColor = 0xa855f7;
        else if (node.type === 'Gigafactory') nodeColor = 0x10b981;

        // 3D Node Mesh (Icosahedron or Sphere)
        const size = isCritical ? 2.6 : isSelected ? 2.8 : 1.8;
        const nodeGeo = new THREE.IcosahedronGeometry(size, 2);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: nodeColor,
          emissive: nodeColor,
          emissiveIntensity: isCritical ? 1.0 : isSelected ? 1.2 : 0.35,
          roughness: 0.2,
          metalness: 0.6,
        });

        const mesh = new THREE.Mesh(nodeGeo, nodeMat);
        mesh.position.copy(pos);
        mesh.userData = { node };
        graphGroup.add(mesh);
        nodeMap.set(node.node_id, mesh);

        // 3D Floating Halo Ring around Critical / Selected Nodes
        if (isCritical || isSelected) {
          const haloGeo = new THREE.RingGeometry(size * 1.3, size * 1.6, 24);
          const haloMat = new THREE.MeshBasicMaterial({
            color: isCritical ? 0xef4444 : 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
          });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.position.copy(pos);
          halo.rotation.x = Math.PI / 2;
          graphGroup.add(halo);
        }
      });
    });

    nodeMeshesRef.current = nodeMap;

    // 3D Directed Corridors & Laser Links
    const pulses: { line: THREE.Line; material: THREE.LineBasicMaterial }[] = [];

    edges.forEach((edge) => {
      const p1 = nodePositions.get(edge.source_node_id);
      const p2 = nodePositions.get(edge.target_node_id);
      if (!p1 || !p2) return;

      const isShockEdge = edge.source_node_id === shockSourceId || edge.target_node_id === shockSourceId;
      const isSelectedEdge = edge.source_node_id === selectedNodeId || edge.target_node_id === selectedNodeId;

      const points = [p1, p2];
      const edgeGeo = new THREE.BufferGeometry().setFromPoints(points);

      const color = isShockEdge
        ? 0xef4444
        : isSelectedEdge
        ? 0x38bdf8
        : edge.status === 'Degraded'
        ? 0xf59e0b
        : isDark
        ? 0x475569
        : 0x94a3b8;

      const edgeMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: isShockEdge || isSelectedEdge ? 0.95 : 0.45,
        linewidth: isShockEdge ? 3 : 1,
      });

      const line = new THREE.Line(edgeGeo, edgeMat);
      graphGroup.add(line);
      pulses.push({ line, material: edgeMat });
    });

    pulseLinesRef.current = pulses;

    // Interaction Controls
    let isMouseDown = false;
    let prevX = 0;
    let prevY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const deltaX = e.clientX - prevX;
        const deltaY = e.clientY - prevY;
        graphGroup.rotation.y += deltaX * 0.005;
        graphGroup.rotation.x += deltaY * 0.005;
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(nodeMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
          setHoveredNode((intersects[0].object.userData?.node as GraphNode) || null);
          container.style.cursor = 'pointer';
        } else {
          setHoveredNode(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodeMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object.userData?.node as GraphNode;
        if (hit) onSelectNode(hit);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.06, 40, 160);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    let tick = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      tick += 0.015;

      if (!isMouseDown) {
        graphGroup.rotation.y += 0.0015;
      }

      // Pulse effects on node meshes
      nodeMeshesRef.current.forEach((mesh) => {
        const node = mesh.userData?.node as GraphNode;
        if (node && (node.active_risk_level === 'Critical' || node.node_id === shockSourceId)) {
          const s = 1 + Math.sin(tick * 5) * 0.15;
          mesh.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [nodes, edges, selectedNodeId, shockSourceId, isDark]);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl backdrop-blur-md">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          isDark ? 'bg-slate-900/80 text-cyan-300 border-cyan-500/30' : 'bg-white/90 text-blue-800 border-blue-200'
        }`}>
          🕸️ 3D SUPPLY TOPOLOGY GRAPH • SPATIAL HIERARCHY
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          isDark ? 'bg-slate-900/80 text-slate-300 border-slate-700' : 'bg-white/90 text-slate-700 border-slate-200'
        }`}>
          T1: MEGA PORTS • T2: FABS & REFINERIES • T3: GIGAFACTORIES
        </div>
      </div>

      {/* Hover Node Tooltip */}
      {hoveredNode && (
        <div className={`absolute bottom-6 left-6 z-30 p-4 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm pointer-events-none ${
          isDark ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100' : 'bg-white/95 border-blue-300 text-slate-900'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-bold">{hoveredNode.node_id}</span>
            <span className="text-xs font-bold text-slate-300 font-mono">Tier {hoveredNode.tier}</span>
          </div>
          <h4 className="font-bold text-sm">{hoveredNode.name}</h4>
          <p className="text-xs text-slate-400 mt-1">{hoveredNode.category} • {hoveredNode.country}</p>
        </div>
      )}

      {/* Controls Hint */}
      <div className={`absolute bottom-4 right-4 z-20 px-3 py-2 rounded-xl text-[11px] font-mono backdrop-blur-md border ${
        isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
      }`}>
        <span>🖱 3D Orbit: Drag • Zoom: Scroll • Select: Click Node</span>
      </div>
    </div>
  );
};
