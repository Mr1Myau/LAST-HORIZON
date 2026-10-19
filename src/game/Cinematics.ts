import * as THREE from 'three';
import { PlanetDef } from '../types/game';
import { PLANETS } from './PlanetData';

export interface SolarSystemVisuals {
  group: THREE.Group;
  planetMeshes: Record<string, THREE.Mesh>;
  orbitRings: THREE.Line[];
  sun: THREE.Mesh;
  starField: THREE.Points;
  updateOrbits: (delta: number) => void;
}

export function createSolarSystemScene(): SolarSystemVisuals {
  const group = new THREE.Group();
  group.name = 'SolarSystem';

  // 1. Starfield background
  const starCount = 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const r = 250 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);

    const c = new THREE.Color();
    c.setHSL(0.55 + Math.random() * 0.15, 0.4, 0.6 + Math.random() * 0.4);
    starColors[i * 3] = c.r;
    starColors[i * 3 + 1] = c.g;
    starColors[i * 3 + 2] = c.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });
  const starField = new THREE.Points(starGeo, starMat);
  group.add(starField);

  // 2. Central Star (Sun)
  const sunGeo = new THREE.SphereGeometry(7.5, 32, 24);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  group.add(sun);

  // Sun Corona / Glow aura
  const coronaGeo = new THREE.SphereGeometry(9.5, 24, 20);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide,
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  group.add(corona);

  const sunLight = new THREE.PointLight(0xfffbeb, 3.5, 350);
  group.add(sunLight);

  // 3. Planets and their orbital rings
  const planetMeshes: Record<string, THREE.Mesh> = {};
  const orbitRings: THREE.Line[] = [];
  const planetAngles: Record<string, number> = {};

  Object.values(PLANETS).forEach((p: PlanetDef, idx: number) => {
    // Orbital path line
    const segments = 90;
    const ringGeo = new THREE.BufferGeometry();
    const ringPoints: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPoints.push(Math.cos(theta) * p.orbitRadius, 0, Math.sin(theta) * p.orbitRadius);
    }
    ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPoints, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.35,
    });
    const orbitLine = new THREE.Line(ringGeo, ringMat);
    group.add(orbitLine);
    orbitRings.push(orbitLine);

    // Planet body
    const planetGeo = new THREE.SphereGeometry(p.size * 0.45, 24, 18);
    const planetMat = new THREE.MeshStandardMaterial({
      color: p.colorHex,
      roughness: 0.6,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(planetGeo, planetMat);
    mesh.name = `SolarPlanet_${p.id}`;

    // Optional Planetary Rings (e.g. for Orion-9 or Unknown-01)
    if (p.rings) {
      const ringMeshGeo = new THREE.RingGeometry(p.size * 0.55, p.size * 0.9, 32);
      ringMeshGeo.rotateX(Math.PI / 2.3);
      const ringMeshMat = new THREE.MeshBasicMaterial({
        color: p.colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringMeshGeo, ringMeshMat);
      mesh.add(ringMesh);
    }

    group.add(mesh);
    planetMeshes[p.id] = mesh;
    planetAngles[p.id] = (idx / 8) * Math.PI * 2;
  });

  const updateOrbits = (delta: number) => {
    Object.values(PLANETS).forEach((p: PlanetDef) => {
      planetAngles[p.id] += delta * p.orbitSpeed * 1.5;
      const angle = planetAngles[p.id];
      const mesh = planetMeshes[p.id];
      if (mesh) {
        mesh.position.set(Math.cos(angle) * p.orbitRadius, 0, Math.sin(angle) * p.orbitRadius);
        mesh.rotation.y += delta * 0.8;
      }
    });
    sun.rotation.y += delta * 0.1;
  };

  return {
    group,
    planetMeshes,
    orbitRings,
    sun,
    starField,
    updateOrbits,
  };
}

// Cataclysm Homeworld Mesh for the intro scene
export function createDestroyedHomeworld(): {
  group: THREE.Group;
  update: (delta: number) => void;
} {
  const group = new THREE.Group();

  // Fractured Core
  const coreGeo = new THREE.SphereGeometry(6, 24, 20);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Molten magma fragments breaking off
  const fragments: THREE.Mesh[] = [];
  const fragMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.9,
    emissive: 0xd97706,
    emissiveIntensity: 0.8,
  });

  for (let i = 0; i < 18; i++) {
    const geo = new THREE.DodecahedronGeometry(1.5 + Math.random() * 2, 0);
    const frag = new THREE.Mesh(geo, fragMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 7.5 + Math.random() * 6;

    frag.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    group.add(frag);
    fragments.push(frag);
  }

  // Shockwave ring
  const shockRingGeo = new THREE.RingGeometry(8, 10, 32);
  shockRingGeo.rotateX(Math.PI / 2);
  const shockRingMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
  group.add(shockRing);

  let timer = 0;
  const update = (delta: number) => {
    timer += delta;
    core.rotation.y += delta * 0.2;
    fragments.forEach((frag, idx) => {
      frag.position.multiplyScalar(1 + delta * 0.04);
      frag.rotation.x += delta * (0.2 + idx * 0.05);
      frag.rotation.y += delta * (0.3 + idx * 0.05);
    });

    const scale = 1 + timer * 0.8;
    shockRing.scale.set(scale, scale, scale);
    shockRingMat.opacity = Math.max(0, 0.8 - timer * 0.15);
  };

  return { group, update };
}
