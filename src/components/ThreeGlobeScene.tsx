import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphNode, GraphEdge } from '../types/models';

interface ThreeGlobeSceneProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  shockSourceId: string | null;
  shockIntensity: number;
  onSelectNode: (node: GraphNode) => void;
  isDark: boolean;
}

export const ThreeGlobeScene: React.FC<ThreeGlobeSceneProps> = ({
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
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const shockRipplesRef = useRef<THREE.Mesh[]>([]);
  const photonParticlesRef = useRef<{ curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; t: number; speed: number }[]>([]);

  // Lat/Lon to 3D Sphere coordinates helper
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 95);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x1e293b : 0xf1f5f9, 2.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x0284c7, 3.5);
    dirLight1.position.set(50, 40, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(isDark ? 0x818cf8 : 0x3b82f6, 2.0);
    dirLight2.position.set(-50, -30, -50);
    scene.add(dirLight2);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const GLOBE_RADIUS = 30;

    // 1. Earth Core Sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x090d16 : 0xdbeafe,
      roughness: 0.65,
      metalness: 0.2,
    });
    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    // 2. Atmospheric Outer Glow Sphere
    const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x0ea5e9 : 0x60a5fa,
      transparent: true,
      opacity: isDark ? 0.18 : 0.25,
      wireframe: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 3. Latitude & Longitude Coordinate Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x334155 : 0x93c5fd,
      transparent: true,
      opacity: 0.45,
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const latRad = (lat * Math.PI) / 180;
      const r = GLOBE_RADIUS * Math.cos(latRad);
      const y = GLOBE_RADIUS * Math.sin(latRad);
      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      ringGeo.setFromPoints(points);
      const ringLine = new THREE.Line(ringGeo, ringMat);
      globeGroup.add(ringLine);
    }

    // 4. Create Node 3D Beacons & Markers
    const nodeMap = new Map<string, THREE.Mesh>();
    nodes.forEach((node) => {
      const pos = latLonToVector3(node.latitude, node.longitude, GLOBE_RADIUS);

      const isShock = node.node_id === shockSourceId;
      const isCritical = node.active_risk_level === 'Critical' || isShock;
      const isHigh = node.active_risk_level === 'High';

      let nodeColor = isDark ? 0x38bdf8 : 0x2563eb;
      if (isCritical) nodeColor = 0xef4444;
      else if (isHigh) nodeColor = 0xf59e0b;
      else if (node.type === 'Fab') nodeColor = 0xa855f7;
      else if (node.type === 'Chokepoint') nodeColor = 0x06b6d4;

      // Base Node Sphere
      const markerGeo = new THREE.SphereGeometry(isCritical ? 1.3 : 0.85, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: isCritical ? 1.2 : 0.45,
        roughness: 0.2,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      markerMesh.userData = { node };

      // Beacon Vertical Beam
      const normal = pos.clone().normalize();
      const beamHeight = isCritical ? 8 : 4;
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.28, beamHeight, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: isCritical ? 0.85 : 0.45,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(beamHeight / 2)));
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      globeGroup.add(markerMesh);
      globeGroup.add(beamMesh);
      nodeMap.set(node.node_id, markerMesh);
    });
    nodeMeshesRef.current = nodeMap;

    // 5. Create 3D Parabolic Curved Arcs for Shipping Corridors
    const photons: { curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; t: number; speed: number }[] = [];

    edges.forEach((edge) => {
      const srcNode = nodes.find((n) => n.node_id === edge.source_node_id);
      const tgtNode = nodes.find((n) => n.node_id === edge.target_node_id);
      if (!srcNode || !tgtNode) return;

      const p1 = latLonToVector3(srcNode.latitude, srcNode.longitude, GLOBE_RADIUS);
      const p2 = latLonToVector3(tgtNode.latitude, tgtNode.longitude, GLOBE_RADIUS);

      // Midpoint elevated away from globe center for 3D parabolic arc
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const arcElevation = GLOBE_RADIUS + Math.min(dist * 0.35, 14);
      const midElevated = mid.normalize().multiplyScalar(arcElevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, midElevated, p2);
      const points = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const isShockCorridor = edge.source_node_id === shockSourceId || edge.target_node_id === shockSourceId;
      const arcColor = isShockCorridor
        ? 0xef4444
        : edge.status === 'Degraded'
        ? 0xf59e0b
        : isDark
        ? 0x38bdf8
        : 0x0284c7;

      const arcMat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: isShockCorridor ? 0.95 : 0.45,
        linewidth: isShockCorridor ? 2 : 1,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);

      // Animated traveling photon particle on arc
      const photonGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({
        color: isShockCorridor ? 0xff4444 : 0x38bdf8,
      });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      globeGroup.add(photonMesh);

      photons.push({
        curve,
        mesh: photonMesh,
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.003,
      });
    });
    photonParticlesRef.current = photons;

    // 6. Shockwave Expanding 3D Rings around Epicenter
    const shockRipples: THREE.Mesh[] = [];
    if (shockSourceId) {
      const epicNode = nodes.find((n) => n.node_id === shockSourceId);
      if (epicNode) {
        const epicPos = latLonToVector3(epicNode.latitude, epicNode.longitude, GLOBE_RADIUS + 0.5);
        const normal = epicPos.clone().normalize();

        for (let i = 0; i < 3; i++) {
          const ringGeo = new THREE.RingGeometry(0.5, 1.2, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.copy(epicPos);
          ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
          ringMesh.userData = { offset: i * 0.33, scaleSpeed: 0.02 };
          globeGroup.add(ringMesh);
          shockRipples.push(ringMesh);
        }
      }
    }
    shockRipplesRef.current = shockRipples;

    // Mouse Interaction (Orbit / Pan / Click Detection)
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        setIsAutoRotate(false);
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Raycast Hover Check
        raycaster.setFromCamera(mouse, camera);
        const interactiveMeshes: THREE.Object3D[] = Array.from(nodeMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);
        if (intersects.length > 0) {
          const hitNode = intersects[0].object.userData?.node as GraphNode;
          setHoveredNode(hitNode || null);
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
      const interactiveMeshes: THREE.Object3D[] = Array.from(nodeMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData?.node as GraphNode;
        if (hitNode) onSelectNode(hitNode);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.05, 50, 140);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationId: number;
    let tick = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      tick += 0.016;

      if (isAutoRotate && !isMouseDown) {
        globeGroup.rotation.y += 0.0025;
      }

      // Update Arc Photons
      photonParticlesRef.current.forEach((p) => {
        p.t = (p.t + p.speed) % 1.0;
        const pos = p.curve.getPoint(p.t);
        p.mesh.position.copy(pos);
      });

      // Update Shockwave Ripple Waves
      shockRipplesRef.current.forEach((r, idx) => {
        const currentScale = 1 + ((tick * 1.5 + idx * 1.2) % 4);
        r.scale.set(currentScale, currentScale, 1);
        const mat = r.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.9 - currentScale * 0.22);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [nodes, edges, shockSourceId, isDark, isAutoRotate]);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl backdrop-blur-md">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          isDark ? 'bg-slate-900/80 text-cyan-300 border-cyan-500/30' : 'bg-white/90 text-blue-800 border-blue-200'
        }`}>
          ⚡ 3D ORBITAL GLOBE ENGINE • REAL-TIME WEBGL
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          isDark ? 'bg-slate-900/80 text-slate-300 border-slate-700' : 'bg-white/90 text-slate-700 border-slate-200'
        }`}>
          ACTIVE NODES: {nodes.length} | CORRIDORS: {edges.length}
        </div>
      </div>

      {/* 3D Interaction Control Tools */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          id="btn-toggle-autorotate"
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border transition-all ${
            isAutoRotate
              ? isDark
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
              : isDark
              ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
              : 'bg-white/80 text-slate-600 border-slate-300 hover:bg-slate-100'
          }`}
        >
          {isAutoRotate ? '⏸ Pause Orbit' : '▶ Auto Orbit'}
        </button>
      </div>

      {/* Hover Node Tooltip */}
      {hoveredNode && (
        <div className={`absolute bottom-6 left-6 z-30 p-4 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm pointer-events-none transition-all ${
          isDark ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100' : 'bg-white/95 border-blue-300 text-slate-900'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-bold">{hoveredNode.node_id}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              hoveredNode.active_risk_level === 'Critical'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : hoveredNode.active_risk_level === 'High'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {hoveredNode.active_risk_level}
            </span>
          </div>
          <h4 className="font-bold text-sm leading-tight">{hoveredNode.name}</h4>
          <div className="mt-2 text-xs grid grid-cols-2 gap-2 font-mono">
            <div>
              <span className="text-slate-400">Category:</span> {hoveredNode.category}
            </div>
            <div>
              <span className="text-slate-400">Country:</span> {hoveredNode.country}
            </div>
            <div>
              <span className="text-slate-400">Tier:</span> T{hoveredNode.tier}
            </div>
            <div>
              <span className="text-slate-400">Criticality:</span> {(hoveredNode.criticality_score * 100).toFixed(0)}%
            </div>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400/90 italic font-sans">
            Click node to open complete operational diagnostics
          </div>
        </div>
      )}

      {/* 3D Navigation Guide at Bottom Right */}
      <div className={`absolute bottom-4 right-4 z-20 px-3 py-2 rounded-xl text-[11px] font-mono backdrop-blur-md border ${
        isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
      }`}>
        <span>🖱 Drag: 360° Rotate • Scroll: Zoom in/out • Click: Select Hub</span>
      </div>
    </div>
  );
};
