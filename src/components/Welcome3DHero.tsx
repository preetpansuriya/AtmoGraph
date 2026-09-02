import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Activity, Globe, Cpu, Zap, ArrowRight, ShieldCheck, Database, Navigation, Boxes, Ship, AlertTriangle, Clock } from 'lucide-react';

interface Welcome3DHeroProps {
  onLaunchDashboard: () => void;
  isDark: boolean;
}

export const Welcome3DHero: React.FC<Welcome3DHeroProps> = ({ onLaunchDashboard, isDark }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Create 3D Wireframe Icosahedron Core
    const sphereGeo = new THREE.IcosahedronGeometry(12, 2);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x06b6d4 : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.45,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(coreSphere);

    // Inner glowing core
    const innerGeo = new THREE.SphereGeometry(6, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x6366f1 : 0x4f46e5,
      emissive: isDark ? 0x3b82f6 : 0x2563eb,
      emissiveIntensity: isDark ? 0.6 : 0.4,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.7,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerCore);

    // Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(18, 0.12, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x0ea5e9,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(22, 0.1, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isDark ? 0xa855f7 : 0x9333ea,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = Math.PI / 6;
    mainGroup.add(ring2);

    // Orbiting GNN Satellite Nodes with Visible Text Labels
    const nodeCount = 18;
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeAngles = Array.from({ length: nodeCount }, (_, i) => (i / nodeCount) * Math.PI * 2);
    const nodeRadii = Array.from({ length: nodeCount }, (_, i) => 15 + (i % 3) * 4);

    const nodeLabels = [
      { name: 'TSMC Fab 18', color: 0x38bdf8, hex: '#38bdf8' },
      { name: 'Malacca Strait [ALERT]', color: 0xef4444, hex: '#ef4444' },
      { name: 'ASML Veldhoven', color: 0x10b981, hex: '#10b981' },
      { name: 'Port of Singapore', color: 0x38bdf8, hex: '#38bdf8' },
      { name: 'NVIDIA AI Compute', color: 0xa855f7, hex: '#a855f7' },
      { name: 'Foxconn Zhengzhou', color: 0xf59e0b, hex: '#f59e0b' },
      { name: 'Shin-Etsu Silicon', color: 0x06b6d4, hex: '#06b6d4' },
      { name: 'Port of Rotterdam', color: 0xef4444, hex: '#ef4444' },
      { name: 'Apple Tier-1 Hub', color: 0x10b981, hex: '#10b981' },
      { name: 'Qualcomm Fabless', color: 0x8b5cf6, hex: '#8b5cf6' },
      { name: 'Samsung Pyeongtaek', color: 0x38bdf8, hex: '#38bdf8' },
      { name: 'Applied Materials', color: 0xf59e0b, hex: '#f59e0b' },
      { name: 'Intel Fab 34', color: 0x06b6d4, hex: '#06b6d4' },
      { name: 'Tokyo Electron', color: 0x10b981, hex: '#10b981' },
      { name: 'SK Hynix HBM3e', color: 0xa855f7, hex: '#a855f7' },
      { name: 'Kyocera Ceramic', color: 0xf59e0b, hex: '#f59e0b' },
      { name: 'Infineon Dresden', color: 0xef4444, hex: '#ef4444' },
      { name: 'Bosch Mobility', color: 0x10b981, hex: '#10b981' },
    ];

    // Helper to generate crisp billboard 3D text sprite for orbiting dots
    const createTextSprite = (text: string, isDarkTheme: boolean, badgeColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 420;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Sprite();

      // Rounded background rectangle with glowing border
      ctx.fillStyle = isDarkTheme ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(8, 8, 404, 74, 18);
      } else {
        ctx.rect(8, 8, 404, 74);
      }
      ctx.fill();
      ctx.stroke();

      // Glowing status dot
      ctx.fillStyle = badgeColor;
      ctx.shadowColor = badgeColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(36, 45, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Text label
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillStyle = isDarkTheme ? '#f8fafc' : '#0f172a';
      ctx.fillText(text, 58, 53);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(7.5, 1.6, 1);
      sprite.position.set(0, 1.8, 0);
      return sprite;
    };

    for (let i = 0; i < nodeCount; i++) {
      const nodeMeta = nodeLabels[i % nodeLabels.length];
      const nodeGeo = new THREE.SphereGeometry(0.75 + (i % 2) * 0.25, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeMeta.color,
        emissive: nodeMeta.color,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

      const labelSprite = createTextSprite(nodeMeta.name, isDark, nodeMeta.hex);
      nodeMesh.add(labelSprite);

      if (nodeMeta.name.includes('ALERT') || nodeMeta.name.includes('TSMC') || nodeMeta.name.includes('ASML')) {
        const haloGeo = new THREE.RingGeometry(1.2, 1.5, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: nodeMeta.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        nodeMesh.add(haloMesh);
      }

      nodeMeshes.push(nodeMesh);
      mainGroup.add(nodeMesh);
    }

    // Dynamic Connecting Lines between nodes
    const linesGeo = new THREE.BufferGeometry();
    const maxLinePoints = nodeCount * 4;
    const linePositions = new Float32Array(maxLinePoints * 3);
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.35 : 0.45,
    });
    const connectingLines = new THREE.LineSegments(linesGeo, linesMat);
    mainGroup.add(connectingLines);

    // Ambient floating star particle field
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 120;
      particlePos[i + 1] = (Math.random() - 0.5) * 80;
      particlePos[i + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.8,
      color: isDark ? 0x94a3b8 : 0x64748b,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, isDark ? 3 : 2, 80);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, isDark ? 2.5 : 1.8, 80);
    pointLight2.position.set(-20, -15, 15);
    scene.add(pointLight2);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      targetX += (mouseX * 5 - targetX) * 0.05;
      targetY += (mouseY * 4 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      coreSphere.rotation.y = elapsedTime * 0.15;
      coreSphere.rotation.x = elapsedTime * 0.08;
      innerCore.rotation.y = -elapsedTime * 0.2;

      ring1.rotation.z = elapsedTime * 0.2;
      ring2.rotation.y = elapsedTime * 0.15;

      let lineIdx = 0;
      const positions = linesGeo.attributes.position.array as Float32Array;

      nodeMeshes.forEach((node, idx) => {
        const angle = nodeAngles[idx] + elapsedTime * (0.2 + (idx % 3) * 0.05);
        const radius = nodeRadii[idx];
        const heightOffset = Math.sin(angle * 2 + idx) * 5;

        node.position.x = Math.cos(angle) * radius;
        node.position.y = heightOffset;
        node.position.z = Math.sin(angle) * radius;

        if (idx < nodeCount - 1 && lineIdx < maxLinePoints * 3 - 6) {
          const nextNode = nodeMeshes[(idx + 1) % nodeCount];
          positions[lineIdx++] = node.position.x;
          positions[lineIdx++] = node.position.y;
          positions[lineIdx++] = node.position.z;

          positions[lineIdx++] = nextNode.position.x;
          positions[lineIdx++] = nextNode.position.y;
          positions[lineIdx++] = nextNode.position.z;
        }
      });

      linesGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.02;

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div className={`relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 3D WebGL Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-85" />

      {/* Decorative ambient gradients */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 ${
        isDark ? 'bg-cyan-500/15' : 'bg-cyan-500/20'
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 ${
        isDark ? 'bg-indigo-500/15' : 'bg-indigo-500/20'
      }`} />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center flex flex-col items-center">
        {/* AtmoGraph Logo & Version Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wide border shadow-sm mb-6 bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          AUTONOMOUS SHOCKWAVE & CHOKEPOINT INTELLIGENCE
        </motion.div>

        {/* Display Typography: ATMO GRAPH */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest font-orbitron max-w-4xl"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            ATMO
          </span>{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            GRAPH
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`mt-4 text-xl sm:text-2xl max-w-2xl font-semibold tracking-wide font-mono ${
            isDark ? 'text-cyan-300' : 'text-cyan-700'
          }`}
        >
          Global Supply Chain Ripple Intelligence
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className={`mt-2 text-sm sm:text-base max-w-xl font-normal leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          Autonomous Graph Attention Networks (GATv2) and real-time Maritime AIS tracking with NLP news disruption mapping. Forecast cascade vulnerabilities across multi-tier supplier networks.
        </motion.p>

        {/* CTA Launch Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-4 justify-center items-center"
        >
          <button
            onClick={onLaunchDashboard}
            id="btn-launch-3d-dashboard"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <span>Launch 3D Command Center</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* 3D Glass Feature Metric Badges: Network Nodes, Active Routes, At Risk, Predicted Delays with animated counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
        >
          <div className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/70 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Boxes className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">NETWORK NODES</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-cyan-400">12,480</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Multi-Tier Entities</div>
          </div>

          <div className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/70 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 text-sky-400 mb-1">
              <Ship className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">ACTIVE ROUTES</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-sky-400">3,892</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Maritime & Air Lanes</div>
          </div>

          <div className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/70 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">AT RISK</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-red-400">18.4%</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cascade Vulnerable</div>
          </div>

          <div className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/70 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">PREDICTED DELAYS</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-amber-400">+14.2d</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mean Inbound Lead-time</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
