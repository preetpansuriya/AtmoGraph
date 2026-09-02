import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AisVessel } from '../types/models';

interface ThreeMaritimeSceneProps {
  vessels: AisVessel[];
  selectedVessel: AisVessel | null;
  onSelectVessel: (vessel: AisVessel) => void;
  isDark: boolean;
}

export const ThreeMaritimeScene: React.FC<ThreeMaritimeSceneProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  isDark,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredVessel, setHoveredVessel] = useState<AisVessel | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const maritimeGroupRef = useRef<THREE.Group | null>(null);
  const vesselMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 40, 90);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(isDark ? 0x0f172a : 0xf8fafc, 2.0);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x0284c7, 3.2);
    dirLight.position.set(40, 60, 40);
    scene.add(dirLight);

    const maritimeGroup = new THREE.Group();
    scene.add(maritimeGroup);
    maritimeGroupRef.current = maritimeGroup;

    // 1. 3D Ocean Surface Plane with Grid Lines
    const oceanGeo = new THREE.PlaneGeometry(140, 140, 32, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x091428 : 0xdbeafe,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    maritimeGroup.add(oceanMesh);

    // 2. 3D Vessels on Ocean
    const vMap = new Map<string, THREE.Group>();

    vessels.forEach((vessel, idx) => {
      const vGroup = new THREE.Group();

      // Normalize Lat/Lon to Ocean Plane coordinates (-60 to +60)
      const x = ((vessel.longitude - 100) / 40) * 45;
      const z = -((vessel.latitude - 20) / 25) * 45;
      vGroup.position.set(x, 1, z);

      const isDelayed = vessel.status === 'Delayed' || vessel.risk_level === 'Critical';
      const isSelected = selectedVessel?.mmsi === vessel.mmsi;

      // 3D Ship Hull
      const hullGeo = new THREE.BoxGeometry(3.6, 1.2, 1.4);
      const hullColor = isDelayed ? 0xef4444 : isSelected ? 0x38bdf8 : isDark ? 0x0ea5e9 : 0x2563eb;
      const hullMat = new THREE.MeshStandardMaterial({
        color: hullColor,
        roughness: 0.4,
        metalness: 0.5,
      });
      const hull = new THREE.Mesh(hullGeo, hullMat);
      hull.position.y = 0.6;
      vGroup.add(hull);

      // Ship Cabin
      const cabinGeo = new THREE.BoxGeometry(1.2, 1.4, 1.0);
      const cabinMat = new THREE.MeshStandardMaterial({ color: isDark ? 0xf8fafc : 0xffffff });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0.9, 1.6, 0);
      vGroup.add(cabin);

      // Vessel Status Beacon / Mast Light
      const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: isDelayed ? 0xff3333 : 0x38bdf8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0.9, 2.5, 0);
      vGroup.add(beacon);

      // Ship Heading Rotation
      vGroup.rotation.y = -(vessel.heading * Math.PI) / 180;
      vGroup.userData = { vessel };

      maritimeGroup.add(vGroup);
      vMap.set(vessel.mmsi, vGroup);
    });

    vesselMeshesRef.current = vMap;

    // 3. Weather Vortex Cylinder (Typhoon / Rough Sea Area)
    const stormGeo = new THREE.CylinderGeometry(14, 18, 12, 32, 1, true);
    const stormMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.45,
    });
    const stormMesh = new THREE.Mesh(stormGeo, stormMat);
    stormMesh.position.set(22, 6, -15);
    maritimeGroup.add(stormMesh);

    // Mouse Interaction
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
        maritimeGroup.rotation.y += deltaX * 0.005;
        maritimeGroup.rotation.x = THREE.MathUtils.clamp(maritimeGroup.rotation.x + deltaY * 0.005, -0.4, 0.4);
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const hitObjects: THREE.Object3D[] = [];
        vesselMeshesRef.current.forEach((g) => hitObjects.push(...g.children));
        const intersects = raycaster.intersectObjects(hitObjects, true);
        if (intersects.length > 0) {
          const parentGroup = intersects[0].object.parent;
          if (parentGroup && parentGroup.userData?.vessel) {
            setHoveredVessel(parentGroup.userData.vessel as AisVessel);
            container.style.cursor = 'pointer';
          }
        } else {
          setHoveredVessel(null);
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
      const hitObjects: THREE.Object3D[] = [];
      vesselMeshesRef.current.forEach((g) => hitObjects.push(...g.children));
      const intersects = raycaster.intersectObjects(hitObjects, true);
      if (intersects.length > 0) {
        const parentGroup = intersects[0].object.parent;
        if (parentGroup && parentGroup.userData?.vessel) {
          onSelectVessel(parentGroup.userData.vessel as AisVessel);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.05, 40, 130);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    let animId: number;
    let tick = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      tick += 0.02;

      // Storm rotation
      stormMesh.rotation.y += 0.015;

      // Vessel bobbing & subtle movement
      vesselMeshesRef.current.forEach((g, mmsi) => {
        g.position.y = 1 + Math.sin(tick * 2 + parseInt(mmsi.slice(-3)) * 0.1) * 0.35;
        g.rotation.z = Math.sin(tick * 1.5) * 0.04;
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
  }, [vessels, selectedVessel, isDark]);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl backdrop-blur-md">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          isDark ? 'bg-slate-900/80 text-cyan-300 border-cyan-500/30' : 'bg-white/90 text-blue-800 border-blue-200'
        }`}>
          🚢 3D AIS MARITIME RADAR • SATELLITE TELEMETRY
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          isDark ? 'bg-slate-900/80 text-slate-300 border-slate-700' : 'bg-white/90 text-slate-700 border-slate-200'
        }`}>
          TRACKING {vessels.length} CONTAINER VESSELS IN TRANSIT
        </div>
      </div>

      {/* Hovered Vessel Card */}
      {hoveredVessel && (
        <div className={`absolute bottom-6 left-6 z-30 p-4 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm pointer-events-none ${
          isDark ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100' : 'bg-white/95 border-blue-300 text-slate-900'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-bold">MMSI: {hoveredVessel.mmsi}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              hoveredVessel.status === 'Delayed'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {hoveredVessel.status}
            </span>
          </div>
          <h4 className="font-bold text-sm">{hoveredVessel.vessel_name}</h4>
          <p className="text-xs text-slate-400 mt-1">
            {hoveredVessel.vessel_type} • Flag: {hoveredVessel.flag} • Speed: {hoveredVessel.speed_knots} kts
          </p>
        </div>
      )}

      {/* Controls Hint */}
      <div className={`absolute bottom-4 right-4 z-20 px-3 py-2 rounded-xl text-[11px] font-mono backdrop-blur-md border ${
        isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
      }`}>
        <span>🖱 3D Orbit: Drag • Zoom: Scroll • Inspect: Click Ship</span>
      </div>
    </div>
  );
};
