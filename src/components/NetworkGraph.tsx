import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphNode, GraphEdge } from '../types/models';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Maximize2,
  AlertTriangle,
  Radio,
  Eye,
  Info,
  Compass
} from 'lucide-react';

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  isDark: boolean;
  activeTimelineDay: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  isDark,
  activeTimelineDay,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'3d_sphere' | 'hierarchical_tiers' | 'force_free'>('3d_sphere');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // References to communicate with Three.js loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const shockParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 60);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Volumetric Ambient Lighting & Atmospheric Theme Integration
    scene.fog = new THREE.FogExp2(isDark ? 0x020617 : 0xf1f5f9, 0.009);

    // Theme-Reactive Volumetric Ambient Light System
    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0x1e293b : 0xffffff, // Sky ambient
      isDark ? 0x0284c7 : 0xbae6fd, // Ground/Atmosphere bounce
      isDark ? 2.2 : 2.6
    );
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x0ea5e9 : 0xf8fafc,
      isDark ? 1.6 : 2.0
    );
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x0284c7, isDark ? 2.8 : 2.2);
    dirLight1.position.set(30, 40, 30);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(isDark ? 0xa855f7 : 0x6366f1, isDark ? 2.2 : 1.8);
    dirLight2.position.set(-30, -20, -30);
    scene.add(dirLight2);

    // Primary Animated Volumetric Light Source (Orbits around scene)
    const volumetricLight1 = new THREE.PointLight(
      isDark ? 0x38bdf8 : 0x0284c7,
      isDark ? 4.2 : 3.2,
      140,
      1.2
    );
    volumetricLight1.position.set(25, 30, 25);
    scene.add(volumetricLight1);

    // Secondary Volumetric Warm Accent Light Source
    const volumetricLight2 = new THREE.PointLight(
      isDark ? 0xa855f7 : 0x3b82f6,
      isDark ? 3.4 : 2.6,
      120,
      1.2
    );
    volumetricLight2.position.set(-25, -15, -25);
    scene.add(volumetricLight2);

    // Volumetric Atmospheric Light Sphere / Glow Field (Integrated with UI theme background)
    const atmosphereGeo = new THREE.SphereGeometry(72, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x0369a1 : 0x38bdf8,
      side: THREE.BackSide,
      transparent: true,
      opacity: isDark ? 0.14 : 0.08,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    atmosphereMesh.name = 'volumetric_atmosphere';
    scene.add(atmosphereMesh);

    // Volumetric Glow Sprite attached to primary volumetric light source
    const createVolumetricGlowSprite = (isDarkTheme: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, isDarkTheme ? 'rgba(56, 189, 248, 0.85)' : 'rgba(2, 132, 199, 0.65)');
      gradient.addColorStop(0.35, isDarkTheme ? 'rgba(14, 165, 233, 0.45)' : 'rgba(56, 189, 248, 0.3)');
      gradient.addColorStop(0.7, isDarkTheme ? 'rgba(2, 132, 199, 0.15)' : 'rgba(186, 230, 253, 0.12)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: isDarkTheme ? THREE.AdditiveBlending : THREE.NormalBlending,
        opacity: isDarkTheme ? 0.8 : 0.5,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(32, 32, 1);
      return sprite;
    };

    const glowSprite = createVolumetricGlowSprite(isDark);
    if (glowSprite) {
      volumetricLight1.add(glowSprite);
    }

    // Root Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // 3. Grid & Orbital Bounds
    const gridHelper = new THREE.GridHelper(70, 20, isDark ? 0x0284c7 : 0x0369a1, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = -22;
    graphGroup.add(gridHelper);

    // 4. Node Geometry and Colors helper
    const getNodeColor = (node: GraphNode) => {
      if (showHeatmap) {
        if (node.currentRisk >= 75) return 0xef4444; // Red Critical
        if (node.currentRisk >= 55) return 0xf97316; // Orange High
        if (node.currentRisk >= 35) return 0xeab308; // Yellow Med
        return 0x10b981; // Emerald Low
      }
      switch (node.type) {
        case 'semiconductor_fab': return 0x06b6d4; // Cyan
        case 'supplier_tier2': return 0x8b5cf6; // Purple
        case 'supplier_tier3': return 0xd946ef; // Fuchsia
        case 'port_terminal': return 0x3b82f6; // Blue
        case 'manufacturing_hub': return 0xf59e0b; // Amber
        case 'distribution_center': return 0x10b981; // Green
        case 'raw_material_mine': return 0xec4899; // Pink
        default: return 0x94a3b8;
      }
    };

    // Calculate node positions based on Layout Mode
    const nodePositions = new Map<string, THREE.Vector3>();

    nodes.forEach((node, idx) => {
      let pos = new THREE.Vector3();
      if (layoutMode === '3d_sphere') {
        const phi = Math.acos(-1 + (2 * idx) / nodes.length);
        const theta = Math.sqrt(nodes.length * Math.PI) * phi;
        const radius = 24;
        pos.set(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        );
      } else if (layoutMode === 'hierarchical_tiers') {
        // Tier 3 on bottom, Tier 2, Tier 1, Hubs on top
        const tierLevels: Record<number, number> = { 3: -15, 2: -5, 1: 5, 0: 15 };
        const y = tierLevels[node.tier] || 0;
        const x = (idx % 4 - 1.5) * 14;
        const z = ((Math.floor(idx / 4) % 3) - 1) * 12;
        pos.set(x, y, z);
      } else {
        // Free organic coordinates from mock dataset
        pos.set(node.coordinates[0], node.coordinates[1], node.coordinates[2]);
      }
      nodePositions.set(node.id, pos);
    });

    // 5. Build 3D Node Meshes & Floating Orbit Labels
    nodeMeshesRef.current.clear();
    const nodeHitBoxes: THREE.Mesh[] = [];

    // Helper to generate crisp billboard 3D text sprite for floating orbit labels
    const createNodeOrbitLabelSprite = (node: GraphNode, isDarkTheme: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = 440;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const riskVal = node.currentRisk;
      const tierText = node.tier === 0 ? 'HUB' : `T${node.tier}`;
      const borderColor = riskVal >= 75 ? '#ef4444' : riskVal >= 55 ? '#f97316' : riskVal >= 35 ? '#eab308' : '#06b6d4';
      const badgeBg = riskVal >= 75 ? 'rgba(239, 68, 68, 0.25)' : riskVal >= 55 ? 'rgba(249, 115, 22, 0.25)' : 'rgba(6, 182, 212, 0.25)';

      // Background rounded container with glowing border
      ctx.fillStyle = isDarkTheme ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(6, 6, 428, 68, 16);
      } else {
        ctx.rect(6, 6, 428, 68);
      }
      ctx.fill();
      ctx.stroke();

      // Tier badge pill on left
      ctx.fillStyle = badgeBg;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(14, 16, 52, 48, 8);
      } else {
        ctx.rect(14, 16, 52, 48);
      }
      ctx.fill();

      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = borderColor;
      ctx.textAlign = 'center';
      ctx.fillText(tierText, 40, 48);

      // Primary Node Label Text
      ctx.textAlign = 'left';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = isDarkTheme ? '#f8fafc' : '#0f172a';
      const labelStr = node.name || node.code || node.id;
      ctx.fillText(labelStr.length > 18 ? labelStr.substring(0, 17) + '…' : labelStr, 76, 48);

      // Risk score pill on right
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillStyle = borderColor;
      ctx.textAlign = 'right';
      ctx.fillText(`${riskVal}%`, 418, 48);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;

      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.renderOrder = 999;
      sprite.scale.set(7.5, 1.36, 1);
      return sprite;
    };

    nodes.forEach((node, nodeIdx) => {
      const pos = nodePositions.get(node.id) || new THREE.Vector3();
      const nodeRadius = 1.4 + (node.capacityUtilization / 100) * 0.8;

      // Node Geometry
      const sphereGeo = new THREE.SphereGeometry(nodeRadius, 32, 32);
      const colorHex = getNodeColor(node);
      const isSelected = selectedNode?.id === node.id;

      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isSelected ? 0.95 : isDark ? 0.45 : 0.25,
        roughness: 0.2,
        metalness: 0.6,
      });

      const nodeMesh = new THREE.Mesh(sphereGeo, sphereMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = {
        nodeId: node.id,
        nodeData: node,
        basePos: pos.clone(),
        nodeIndex: nodeIdx,
        nodeRadius: nodeRadius,
      };

      // Outer Halo Ring for High Risk / Critical Nodes
      if (node.currentRisk >= 55) {
        const ringGeo = new THREE.RingGeometry(nodeRadius * 1.3, nodeRadius * 1.6, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: node.currentRisk >= 75 ? 0xef4444 : 0xf97316,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.name = 'risk_halo';
        nodeMesh.add(ringMesh);
      }

      // Selection Glow Wireframe
      if (isSelected) {
        const selGeo = new THREE.IcosahedronGeometry(nodeRadius * 1.8, 1);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.8,
        });
        const selMesh = new THREE.Mesh(selGeo, selMat);
        selMesh.name = 'selection_glow';
        nodeMesh.add(selMesh);
      }

      // Orbital Nodal Ring
      const orbitRingGeo = new THREE.RingGeometry(nodeRadius * 1.1, nodeRadius * 1.25, 20);
      const orbitRingMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0x0ea5e9 : 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
      orbitRing.rotation.x = Math.PI / 2;
      nodeMesh.add(orbitRing);

      // Attach floating billboard text label at orbit position
      const labelSprite = createNodeOrbitLabelSprite(node, isDark);
      if (labelSprite) {
        labelSprite.position.set(0, nodeRadius + 1.8, 0);
        labelSprite.name = 'orbit_label_sprite';
        nodeMesh.add(labelSprite);
        nodeMesh.userData.labelSprite = labelSprite;
      }

      // 3D Depth Elevation Pillar / Guideline to base anchor
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 1, 8);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.name = 'elevation_pillar';
      pillar.visible = false;
      graphGroup.add(pillar);
      nodeMesh.userData.pillar = pillar;

      graphGroup.add(nodeMesh);
      nodeMeshesRef.current.set(node.id, nodeMesh);
      nodeHitBoxes.push(nodeMesh);
    });

    // 6. Build 3D Edges with Bezier Curves & Flow Particle Beams
    const edgeCurves: THREE.CatmullRomCurve3[] = [];
    const edgeLinesGroup = new THREE.Group();
    graphGroup.add(edgeLinesGroup);

    edges.forEach(edge => {
      const sourcePos = nodePositions.get(edge.source);
      const targetPos = nodePositions.get(edge.target);

      if (sourcePos && targetPos) {
        // Curve midpoint with slight 3D elevation
        const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
        const distance = sourcePos.distanceTo(targetPos);
        midPoint.y += distance * 0.18;

        const curve = new THREE.CatmullRomCurve3([sourcePos, midPoint, targetPos]);
        edgeCurves.push(curve);

        const points = curve.getPoints(36);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        const isShocked = edge.activeShockwave;
        const lineMat = new THREE.LineBasicMaterial({
          color: isShocked ? 0xef4444 : isDark ? 0x38bdf8 : 0x0284c7,
          transparent: true,
          opacity: isShocked ? 0.9 : isDark ? 0.35 : 0.5,
          linewidth: isShocked ? 2 : 1,
        });

        const line = new THREE.Line(lineGeo, lineMat);
        edgeLinesGroup.add(line);
      }
    });

    // 7. Dynamic Flow Particles on Edges (Shockwaves / Logistics stream)
    const totalParticleCount = edgeCurves.length * 15;
    const particlePositions = new Float32Array(totalParticleCount * 3);
    const particleColors = new Float32Array(totalParticleCount * 3);
    const particleTValues = new Float32Array(totalParticleCount);

    let pIdx = 0;
    edgeCurves.forEach((_, curveIdx) => {
      const edge = edges[curveIdx];
      const isShock = edge?.activeShockwave;

      for (let i = 0; i < 15; i++) {
        particleTValues[pIdx] = (i / 15) + Math.random() * 0.05;
        // Color
        if (isShock) {
          particleColors[pIdx * 3] = 1.0; // R
          particleColors[pIdx * 3 + 1] = 0.2; // G
          particleColors[pIdx * 3 + 2] = 0.2; // B
        } else {
          particleColors[pIdx * 3] = 0.2;
          particleColors[pIdx * 3 + 1] = 0.8;
          particleColors[pIdx * 3 + 2] = 1.0;
        }
        pIdx++;
      }
    });

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const shockParticles = new THREE.Points(particlesGeo, particlesMat);
    shockParticlesRef.current = shockParticles;
    graphGroup.add(shockParticles);

    // 8. Mouse & Interactive Controls (Raycasting & Orbit rotation)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      // Handle Drag Rotation
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        graphGroup.rotation.y += deltaX * 0.006;
        graphGroup.rotation.x += deltaY * 0.006;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Handle Hover Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeHitBoxes, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData.nodeData as GraphNode;
        if (data) {
          setHoveredNode(data);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        container.style.cursor = isDragging ? 'grabbing' : 'default';
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      container.style.cursor = 'default';
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeHitBoxes, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData.nodeData as GraphNode;
        if (data) {
          onSelectNode(data);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(120, Math.max(20, camera.position.z + e.deltaY * 0.05));
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate && !isDragging) {
        graphGroup.rotation.y += 0.003;
      }

      // Animate edge particles
      let particleIndex = 0;
      const positions = particlesGeo.attributes.position.array as Float32Array;

      // Animate Volumetric Light Sources & Atmospheric Breathing
      volumetricLight1.position.x = Math.sin(elapsedTime * 0.7) * 36;
      volumetricLight1.position.z = Math.cos(elapsedTime * 0.7) * 36;
      volumetricLight1.position.y = 24 + Math.sin(elapsedTime * 1.3) * 10;
      volumetricLight1.intensity = (isDark ? 4.2 : 3.2) + Math.sin(elapsedTime * 2.2) * 0.6;

      volumetricLight2.position.x = Math.cos(elapsedTime * 0.5) * -32;
      volumetricLight2.position.z = Math.sin(elapsedTime * 0.5) * -32;
      volumetricLight2.position.y = -14 + Math.cos(elapsedTime * 1.1) * 8;

      edgeCurves.forEach(curve => {
        for (let i = 0; i < 15; i++) {
          let t = particleTValues[particleIndex] + 0.008;
          if (t > 1.0) t -= 1.0;
          particleTValues[particleIndex] = t;

          const pt = curve.getPoint(t);
          positions[particleIndex * 3] = pt.x;
          positions[particleIndex * 3 + 1] = pt.y;
          positions[particleIndex * 3 + 2] = pt.z;

          particleIndex++;
        }
      });

      particlesGeo.attributes.position.needsUpdate = true;

      // Animate risk halos (pulsing) & Interactive 3D Depth-Scaling Elevation
      nodeMeshesRef.current.forEach((mesh, id) => {
        const halo = mesh.getObjectByName('risk_halo');
        if (halo) {
          halo.lookAt(camera.position);
          const scale = 1 + Math.sin(elapsedTime * 4) * 0.15;
          halo.scale.set(scale, scale, scale);
        }

        const selGlow = mesh.getObjectByName('selection_glow');
        if (selGlow) {
          selGlow.rotation.x += 0.02;
          selGlow.rotation.y += 0.02;
        }

        // 1. Floating Text Label smooth animation at orbital position
        const labelSprite = mesh.userData.labelSprite as THREE.Sprite;
        const nodeIdx = mesh.userData.nodeIndex || 0;
        const baseRadius = (mesh.userData.nodeRadius as number) || 1.6;
        if (labelSprite) {
          // Floating oscillation on Y-axis
          const floatOffset = Math.sin(elapsedTime * 2.2 + nodeIdx * 0.7) * 0.35;
          labelSprite.position.y = baseRadius + 1.8 + floatOffset;
        }

        // 2. Interactive Depth-Scaling Feature on Click / Selection
        const basePos = mesh.userData.basePos as THREE.Vector3;
        const isElevated = (selectedNode && selectedNode.id === id);
        const pillar = mesh.userData.pillar as THREE.Mesh;

        let targetPos = basePos.clone();
        let targetScale = 1.0;

        if (isElevated) {
          // Elevate along outward normal vector and Z-axis for dramatic 3D pop
          const outwardVec = basePos.clone().normalize();
          if (outwardVec.lengthSq() < 0.01) outwardVec.set(0, 0, 1);
          
          targetPos = basePos.clone()
            .add(outwardVec.multiplyScalar(6.5))
            .add(new THREE.Vector3(0, 3.5, 14));
          targetScale = 1.42;

          // Render glowing 3D elevation pillar connecting anchor base to elevated node
          if (pillar) {
            pillar.visible = true;
            const mid = new THREE.Vector3().addVectors(basePos, mesh.position).multiplyScalar(0.5);
            pillar.position.copy(mid);
            const dist = basePos.distanceTo(mesh.position);
            pillar.scale.set(1, Math.max(0.1, dist), 1);
            pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mesh.position.clone().sub(basePos).normalize());
          }
        } else {
          if (pillar) {
            pillar.visible = false;
          }
        }

        // Smooth spring lerp for position and depth-scaling
        mesh.position.lerp(targetPos, 0.12);
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
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
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nodes, edges, selectedNode, isDark, layoutMode, showHeatmap, autoRotate, activeTimelineDay]);

  const handleResetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 15, 60);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(120, Math.max(20, cameraRef.current.position.z + delta));
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border transition-all duration-300 ${
      isDark
        ? 'bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border-slate-800 shadow-2xl text-slate-100'
        : 'bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-100 border-slate-300 shadow-xl text-slate-900'
    }`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Left Graph HUD overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className={`backdrop-blur-md rounded-xl p-3 shadow-xl max-w-xs pointer-events-auto border transition-all ${
          isDark
            ? 'bg-slate-900/85 border-slate-700/70 text-slate-200 shadow-cyan-950/20'
            : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
              isDark ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              GNN TOPOLOGY GRAPH
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isDark
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-cyan-50 text-cyan-700 border-cyan-200'
            }`}>
              {nodes.length} Nodes • {edges.length} Edges
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            3D Graph Neural Network with Volumetric Ambient Illumination & Attention Propagation.
          </p>
        </div>

        {/* Hover Node Tooltip */}
        {hoveredNode && (
          <div className={`backdrop-blur-md rounded-xl p-3 shadow-2xl animate-fade-in pointer-events-auto border ${
            isDark
              ? 'bg-slate-950/90 border-cyan-500/50 text-white'
              : 'bg-white/95 border-cyan-400 text-slate-900 shadow-cyan-100'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-sm font-orbitron">{hoveredNode.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                hoveredNode.riskLevel === 'critical' ? 'bg-red-500/20 text-red-500 border border-red-500/40' :
                hoveredNode.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40' :
                hoveredNode.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/40' :
                'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40'
              }`}>
                {hoveredNode.riskLevel} Risk
              </span>
            </div>
            <div className={`mt-2 grid grid-cols-2 gap-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div>Risk Score: <span className="font-bold text-cyan-500">{hoveredNode.currentRisk}%</span></div>
              <div>Buffer: <span className="text-amber-500">{hoveredNode.inventoryBufferDays} Days</span></div>
              <div>Exposure: <span className="text-emerald-500">${hoveredNode.financialExposureUsd}M</span></div>
              <div>Attention: <span className="text-indigo-500">{hoveredNode.attentionScore}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Top Right 3D Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 pointer-events-auto">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-md ${
            autoRotate
              ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-400'
              : isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle 3D auto orbit rotation"
        >
          <Compass className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>Auto Rotate</span>
        </button>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-md ${
            showHeatmap
              ? 'bg-indigo-500/25 border-indigo-500/50 text-indigo-400'
              : isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle GNN risk heatmap colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Risk Heatmap</span>
        </button>

        <div className={`flex backdrop-blur-md border rounded-lg p-0.5 ${
          isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-slate-300 shadow-sm'
        }`}>
          <button
            onClick={() => setLayoutMode('3d_sphere')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              layoutMode === '3d_sphere' ? 'bg-cyan-500 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sphere
          </button>
          <button
            onClick={() => setLayoutMode('hierarchical_tiers')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              layoutMode === 'hierarchical_tiers' ? 'bg-cyan-500 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiers 3D
          </button>
          <button
            onClick={() => setLayoutMode('force_free')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              layoutMode === 'force_free' ? 'bg-cyan-500 text-white shadow' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Global
          </button>
        </div>
      </div>

      {/* Floating Bottom Left Legend */}
      <div className={`absolute bottom-4 left-4 z-20 backdrop-blur-md border rounded-xl p-3 shadow-lg pointer-events-auto hidden sm:block ${
        isDark ? 'bg-slate-950/85 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className={`text-[11px] font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>GNN Node Archetypes</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Semiconductor Fab</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Port Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Tier-1 Assembly</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Tier-2 Supplier</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Raw Material Mine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Distribution Hub</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Camera controls */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2 pointer-events-auto">
        <button
          onClick={() => handleZoom(-10)}
          className={`p-2 rounded-lg border transition-all shadow-md ${
            isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(10)}
          className={`p-2 rounded-lg border transition-all shadow-md ${
            isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className={`p-2 rounded-lg border transition-all shadow-md ${
            isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
