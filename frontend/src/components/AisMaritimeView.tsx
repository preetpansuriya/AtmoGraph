import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AisVessel, AisPort } from '../types/models';
import {
  Ship,
  Anchor,
  Wind,
  Clock,
  Compass,
  AlertOctagon,
  Search,
  Filter,
  Layers,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AisMaritimeViewProps {
  vessels: AisVessel[];
  ports: AisPort[];
  selectedVessel: AisVessel | null;
  onSelectVessel: (vessel: AisVessel | null) => void;
  isDark: boolean;
}

export const AisMaritimeView: React.FC<AisMaritimeViewProps> = ({
  vessels,
  ports,
  selectedVessel,
  onSelectVessel,
  isDark,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPort, setSelectedPort] = useState<AisPort | null>(null);
  const [vesselFilter, setVesselFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showCongestionRings, setShowCongestionRings] = useState<boolean>(true);

  // Three.js globe references
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Convert lat/lng to 3D sphere coordinate
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 65);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    const globeRadius = 20;

    // 1. Globe Ocean Sphere
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Atmospheric outer glow
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: isDark ? 0.08 : 0.12,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphere);

    // Latitude / Longitude 3D Wireframe Graticule
    const graticuleGeo = new THREE.SphereGeometry(globeRadius + 0.05, 36, 18);
    const graticuleMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x1e293b : 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const graticule = new THREE.Mesh(graticuleGeo, graticuleMat);
    globeGroup.add(graticule);

    // 2. Continent Landmass Points
    const landPointsCount = 2000;
    const landPositions = new Float32Array(landPointsCount * 3);
    for (let i = 0; i < landPointsCount; i++) {
      // Approximate global land distribution sampling
      const lat = (Math.random() - 0.5) * 140;
      const lng = (Math.random() - 0.5) * 360;
      const pt = latLngToVector3(lat, lng, globeRadius + 0.1);
      landPositions[i * 3] = pt.x;
      landPositions[i * 3 + 1] = pt.y;
      landPositions[i * 3 + 2] = pt.z;
    }
    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.BufferAttribute(landPositions, 3));
    const landMat = new THREE.PointsMaterial({
      size: 0.7,
      color: isDark ? 0x38bdf8 : 0x0284c7,
      transparent: true,
      opacity: 0.65,
    });
    const landMesh = new THREE.Points(landGeo, landMat);
    globeGroup.add(landMesh);

    // 3. Major Maritime Trade Arcs (Trans-Pacific, Malacca-Suez, Atlantic)
    if (showRoutes) {
      const maritimeRoutes: [number, number, number, number][] = [
        [1.28, 103.85, 33.74, -118.27], // Singapore to LA
        [1.28, 103.85, 51.95, 4.13],   // Singapore to Rotterdam
        [22.61, 120.28, 33.74, -118.27], // Kaohsiung to LA
        [-23.8, -69.1, 29.8, 121.5],   // Chile to Ningbo
        [25.0, 55.0, 51.95, 4.13],      // Middle East to Europe
      ];

      maritimeRoutes.forEach(([lat1, lng1, lat2, lng2]) => {
        const v1 = latLngToVector3(lat1, lng1, globeRadius);
        const v2 = latLngToVector3(lat2, lng2, globeRadius);
        const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
        const distance = v1.distanceTo(v2);
        mid.normalize().multiplyScalar(globeRadius + distance * 0.2);

        const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
        const pts = curve.getPoints(40);
        const routeGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const routeMat = new THREE.LineDashedMaterial({
          color: 0x38bdf8,
          dashSize: 1,
          gapSize: 0.5,
          transparent: true,
          opacity: 0.5,
        });
        const routeLine = new THREE.Line(routeGeo, routeMat);
        routeLine.computeLineDistances();
        globeGroup.add(routeLine);
      });
    }

    // 4. Ports Markers and Congestion Rings
    const portMeshes: THREE.Mesh[] = [];
    ports.forEach(port => {
      const portPos = latLngToVector3(port.geo.lat, port.geo.lng, globeRadius + 0.3);

      const pGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
      const pMat = new THREE.MeshStandardMaterial({
        color: port.congestionIndex > 70 ? 0xef4444 : 0x06b6d4,
        emissive: port.congestionIndex > 70 ? 0xef4444 : 0x06b6d4,
        emissiveIntensity: 0.8,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(portPos);
      pMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), portPos.clone().normalize());
      pMesh.userData = { type: 'port', data: port };
      // Port Text Sprite Label
      const createPortLabel = (name: string, congestion: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 340;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const borderCol = congestion > 70 ? '#ef4444' : '#06b6d4';
        ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(4, 4, 332, 56, 12);
        } else {
          ctx.rect(4, 4, 332, 56);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = borderCol;
        ctx.beginPath();
        ctx.arc(24, 32, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.fillText(name.length > 18 ? name.substring(0, 17) + '…' : name, 42, 39);

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
        sprite.scale.set(4.5, 0.85, 1);
        sprite.position.set(0, 1.4, 0);
        return sprite;
      };

      const portLabel = createPortLabel(port.name, port.congestionIndex);
      if (portLabel) {
        pMesh.add(portLabel);
      }

      globeGroup.add(pMesh);
      portMeshes.push(pMesh);

      // Congestion Beacon Waves
      if (showCongestionRings) {
        const waveGeo = new THREE.RingGeometry(0.8, 1.4, 24);
        const waveMat = new THREE.MeshBasicMaterial({
          color: port.congestionIndex > 70 ? 0xef4444 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const waveMesh = new THREE.Mesh(waveGeo, waveMat);
        waveMesh.position.copy(portPos);
        waveMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), portPos.clone().normalize());
        waveMesh.name = 'port_wave';
        globeGroup.add(waveMesh);
      }
    });

    // 5. Vessels 3D Cones / Pyramids
    const vesselMeshes: THREE.Mesh[] = [];
    vessels.forEach(vessel => {
      const vPos = latLngToVector3(vessel.geo.lat, vessel.geo.lng, globeRadius + 0.4);

      // Directional 3D Vessel Marker
      const coneGeo = new THREE.ConeGeometry(0.5, 1.2, 4);
      let vColor = 0x10b981;
      if (vessel.riskStatus === 'critical') vColor = 0xef4444;
      else if (vessel.riskStatus === 'high') vColor = 0xf97316;
      else if (vessel.riskStatus === 'medium') vColor = 0xeab308;

      const isSelected = selectedVessel?.id === vessel.id;

      const coneMat = new THREE.MeshStandardMaterial({
        color: vColor,
        emissive: vColor,
        emissiveIntensity: isSelected ? 1.0 : 0.6,
      });

      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.copy(vPos);
      coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vPos.clone().normalize());
      coneMesh.userData = { type: 'vessel', data: vessel };

      if (isSelected) {
        const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        const boxMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        coneMesh.add(box);
      }

      // Floating vessel label sprite
      const createVesselLabel = (name: string, riskStatus: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const borderCol = riskStatus === 'critical' ? '#ef4444' : riskStatus === 'high' ? '#f97316' : '#10b981';
        ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(4, 4, 312, 52, 10);
        } else {
          ctx.rect(4, 4, 312, 52);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = borderCol;
        ctx.beginPath();
        ctx.arc(22, 30, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 18px "JetBrains Mono", monospace';
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.fillText(name.length > 17 ? name.substring(0, 16) + '…' : name, 38, 36);

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
        sprite.scale.set(4.2, 0.8, 1);
        sprite.position.set(0, 1.6, 0);
        return sprite;
      };

      const vesselLabel = createVesselLabel(vessel.name, vessel.riskStatus);
      if (vesselLabel) {
        coneMesh.add(vesselLabel);
      }

      globeGroup.add(coneMesh);
      vesselMeshes.push(coneMesh);
    });

    // 6. Volumetric Ambient Lighting & Theme Atmosphere
    scene.fog = new THREE.FogExp2(isDark ? 0x020617 : 0xf1f5f9, 0.008);

    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0x0f172a : 0xffffff,
      isDark ? 0x0284c7 : 0xbae6fd,
      isDark ? 2.0 : 2.4
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x0284c7, isDark ? 2.8 : 2.2);
    sunLight.position.set(50, 20, 50);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(isDark ? 0x0ea5e9 : 0xf8fafc, isDark ? 1.4 : 1.8);
    scene.add(ambientLight);

    // Volumetric Atmospheric Orbiting Point Light
    const globeVolumetricLight = new THREE.PointLight(isDark ? 0x38bdf8 : 0x0284c7, isDark ? 3.5 : 2.5, 120, 1.2);
    globeVolumetricLight.position.set(30, 25, 30);
    scene.add(globeVolumetricLight);

    // 7. Interactive Drag & Raycast Click
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMouse.x;
        const deltaY = e.clientY - previousMouse.y;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;

        previousMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const allTargets = [...vesselMeshes, ...portMeshes];
      const intersects = raycaster.intersectObjects(allTargets, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData.type === 'vessel') {
          onSelectVessel(hit.userData.data as AisVessel);
          setSelectedPort(null);
        } else if (hit.userData.type === 'port') {
          setSelectedPort(hit.userData.data as AisPort);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // 8. Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      // Animate Volumetric Light Orbit
      globeVolumetricLight.position.x = Math.sin(elapsedTime * 0.6) * 35;
      globeVolumetricLight.position.z = Math.cos(elapsedTime * 0.6) * 35;
      globeVolumetricLight.position.y = 20 + Math.sin(elapsedTime * 1.1) * 8;
      globeVolumetricLight.intensity = (isDark ? 3.5 : 2.5) + Math.sin(elapsedTime * 2.0) * 0.5;

      // Animate port wave ripples
      globeGroup.children.forEach(child => {
        if (child.name === 'port_wave') {
          const s = 1 + (Math.sin(elapsedTime * 3) + 1) * 0.25;
          child.scale.set(s, s, s);
        }
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
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [vessels, ports, selectedVessel, isDark, showRoutes, showCongestionRings]);

  // Filtered vessels
  const filteredVessels = vessels.filter(v => {
    const matchesFilter = vesselFilter === 'all' || v.type === vesselFilter;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.mmsi.includes(searchQuery) ||
                          v.destinationPort.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`relative w-full h-full min-h-[640px] rounded-2xl overflow-hidden border grid grid-cols-1 lg:grid-cols-12 gap-0 ${
      isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
    }`}>
      {/* 3D Globe Visualizer Area */}
      <div className="lg:col-span-8 relative min-h-[420px] lg:min-h-full">
        <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

        {/* Top Floating HUD */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="backdrop-blur-md bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 shadow-xl max-w-sm pointer-events-auto">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                <Ship className="w-4 h-4" />
                3D AIS MARITIME RADAR
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                LIVE SAT-AIS FEED
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive 3D Shipping Globe. Real-time vessel positions, ETA delay anomalies, and port congestion choke indices.
            </p>
          </div>
        </div>

        {/* Map Layers Toggle buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border transition-all ${
              showRoutes ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            Shipping Lanes
          </button>
          <button
            onClick={() => setShowCongestionRings(!showCongestionRings)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border transition-all ${
              showCongestionRings ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            Port Congestion
          </button>
        </div>

        {/* Bottom Chokepoint Alert Ticker */}
        <div className="absolute bottom-4 left-4 right-4 z-20 backdrop-blur-md bg-slate-950/85 border border-red-500/30 rounded-xl p-3 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertOctagon className="w-5 h-5 animate-pulse shrink-0" />
            <div className="text-xs">
              <span className="font-bold uppercase font-mono">Chokepoint Alert:</span> Malacca Strait transshipment queue reaching 42 hrs avg dwell time. 14 container vessels impacted.
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap hidden sm:inline">
            Updated: 2 mins ago
          </span>
        </div>
      </div>

      {/* Right Sidebar: Telemetry & Vessel Roster */}
      <div className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 flex flex-col gap-4 overflow-y-auto max-h-[640px] ${
        isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-800 bg-slate-900/60'
      }`}>
        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vessel, MMSI, or port..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950/60 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['all', 'container_ship', 'bulk_carrier', 'lng_carrier'].map(t => (
              <button
                key={t}
                onClick={() => setVesselFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize whitespace-nowrap transition-all ${
                  vesselFilter === t
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Port Card (if port clicked) */}
        {selectedPort && (
          <div className="p-3.5 rounded-xl border border-sky-500/40 bg-sky-950/30 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-sm">
                <Anchor className="w-4 h-4" />
                {selectedPort.name}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                {selectedPort.code}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
              <div>Congestion Index: <span className="font-bold text-red-400">{selectedPort.congestionIndex}/100</span></div>
              <div>Waiting Vessels: <span className="text-amber-300">{selectedPort.waitingVesselsCount} Ships</span></div>
              <div>Turnaround: <span className="text-slate-200">{selectedPort.avgTurnaroundHours} hrs</span></div>
              <div>Status: <span className="text-red-300 uppercase">{selectedPort.status.replace('_', ' ')}</span></div>
            </div>
          </div>
        )}

        {/* Active Selected Vessel Detail Card */}
        {selectedVessel ? (
          <div className="p-4 rounded-xl border border-cyan-500/50 bg-slate-950/80 space-y-3 shadow-xl animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedVessel.type.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5 font-orbitron">{selectedVessel.name}</h4>
                <div className="text-xs text-slate-400 font-mono">
                  MMSI: {selectedVessel.mmsi} • Flag: {selectedVessel.flag}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                selectedVessel.riskStatus === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                selectedVessel.riskStatus === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {selectedVessel.riskStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Route:</span>
                <span className="text-slate-100 font-medium">{selectedVessel.originPort} → {selectedVessel.destinationPort}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Speed / Heading:</span>
                <span className="text-cyan-300">{selectedVessel.speedKnots} kts @ {selectedVessel.headingDeg}°</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">ETA / Delay:</span>
                <span className="text-amber-300">+{selectedVessel.delayHours} hrs ({selectedVessel.eta})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Cargo Exposure:</span>
                <span className="text-emerald-300 font-bold">${selectedVessel.cargoValueUsdM}M USD</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-400">
                <span className="text-cyan-400">Manifest:</span> {selectedVessel.cargoDescription}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
            Click any vessel icon on the 3D globe or select from the fleet list below to view telemetry.
          </div>
        )}

        {/* Vessel List */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Tracked Fleet ({filteredVessels.length})</span>
            <span className="text-[10px] text-cyan-400 font-normal">Auto-synced</span>
          </div>

          <div className="space-y-1.5">
            {filteredVessels.map(v => (
              <div
                key={v.id}
                onClick={() => onSelectVessel(v)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedVessel?.id === v.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-cyan-400" />
                    {v.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {v.originPort} → {v.destinationPort}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold ${
                    v.delayHours > 30 ? 'text-red-400' : v.delayHours > 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    +{v.delayHours}h
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">${v.cargoValueUsdM}M</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
