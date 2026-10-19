import * as THREE from 'three';
import { PlanetDef, InteractableObject } from '../types/game';
import { WEAPON_TYPES, createWeaponPickupNode } from './WeaponSystem';

// Multi-octave Perlin-like mathematical noise function
function pseudoNoise(x: number, z: number): number {
  const s1 = Math.sin(x * 0.035) * Math.cos(z * 0.035);
  const s2 = Math.sin(x * 0.08 + z * 0.04) * Math.cos(z * 0.07 - x * 0.03) * 0.5;
  const s3 = Math.sin(x * 0.15 - z * 0.12) * Math.cos(x * 0.09 + z * 0.16) * 0.25;
  return s1 + s2 + s3;
}

export interface TerrainResult {
  terrainMesh: THREE.Mesh;
  getTerrainHeight: (x: number, z: number) => number;
  decorationsGroup: THREE.Group;
  interactables: InteractableObject[];
  interactableMeshes: THREE.Group;
  particles: THREE.Points;
  skyDome: THREE.Mesh;
}

export function buildPlanetEnvironment(planet: PlanetDef): TerrainResult {
  const decorationsGroup = new THREE.Group();
  decorationsGroup.name = 'PlanetDecorations';

  const interactableMeshes = new THREE.Group();
  interactableMeshes.name = 'PlanetInteractables';

  const interactables: InteractableObject[] = [];

  // Terrain height calculation function
  const getTerrainHeight = (x: number, z: number): number => {
    // Keep landing zone smooth and flat around (0, 0)
    const distFromOrigin = Math.sqrt(x * x + z * z);
    const flatRadius = 14;
    const blendRadius = 30;

    let heightScale = 7;
    if (planet.type === 'Volcanic') heightScale = 11;
    if (planet.type === 'Ocean') heightScale = 3.5;
    if (planet.type === 'Ice') heightScale = 8;
    if (planet.type === 'Unknown') heightScale = 14;

    const rawNoise = pseudoNoise(x, z) * heightScale;

    if (distFromOrigin < flatRadius) {
      return 0; // completely flat landing pad
    } else if (distFromOrigin < blendRadius) {
      const t = (distFromOrigin - flatRadius) / (blendRadius - flatRadius);
      // Smooth Hermite interpolation
      const smoothT = t * t * (3 - 2 * t);
      return rawNoise * smoothT;
    }
    return rawNoise;
  };

  // 1. Build Terrain Mesh
  const size = 320;
  const segments = 120;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const count = posAttr.count;

  // Vertex coloring for varied geological strata
  const colors = new Float32Array(count * 3);
  const baseColor = new THREE.Color(planet.groundColor);
  const rockColor = new THREE.Color(planet.rockColor);
  const altColor = new THREE.Color(planet.sunColor);

  for (let i = 0; i < count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = getTerrainHeight(vx, vz);
    posAttr.setY(i, vy);

    // Height-based color blending
    const heightFactor = THREE.MathUtils.clamp((vy + 4) / 14, 0, 1);
    const blended = baseColor.clone().lerp(rockColor, heightFactor);

    // Slopes get more rock color
    if (Math.abs(vy) > 5) {
      blended.lerp(altColor, 0.15);
    }

    colors[i * 3] = blended.r;
    colors[i * 3 + 1] = blended.g;
    colors[i * 3 + 2] = blended.b;
  }

  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: planet.type === 'Ice' ? 0.2 : 0.85,
    metalness: planet.type === 'Ice' ? 0.3 : 0.15,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;

  // 2. Landing Pad Decal / Ring at (0, 0)
  const padGeo = new THREE.RingGeometry(5.5, 7.5, 32);
  padGeo.rotateX(-Math.PI / 2);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.8,
    roughness: 0.3,
  });
  const landingPad = new THREE.Mesh(padGeo, padMat);
  landingPad.position.y = 0.05;
  landingPad.receiveShadow = true;
  decorationsGroup.add(landingPad);

  // 3. Procedural Rocks & Formations (Instanced for high performance)
  const rockCount = 90;
  const rockGeo = new THREE.DodecahedronGeometry(1.6, 1);
  const rockInstMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(planet.rockColor),
    roughness: 0.8,
    flatShading: true,
  });
  const rockMesh = new THREE.InstancedMesh(rockGeo, rockInstMat, rockCount);
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let rockIndex = 0;

  for (let i = 0; i < rockCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 120;
    const rx = Math.cos(angle) * dist;
    const rz = Math.sin(angle) * dist;
    const ry = getTerrainHeight(rx, rz);

    const scale = 0.6 + Math.random() * 2.2;
    dummy.position.set(rx, ry + scale * 0.4, rz);
    dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.8), scale);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();

    rockMesh.setMatrixAt(rockIndex++, dummy.matrix);
  }
  rockMesh.instanceMatrix.needsUpdate = true;
  decorationsGroup.add(rockMesh);

  // 4. Biome-Specific Flora & Spire Formations
  const floraCount = 70;
  const floraGroup = new THREE.Group();

  let floraStemColor = 0x334155;
  let floraCapColor = 0x10b981;

  if (planet.type === 'Ice') {
    floraStemColor = 0xbae6fd;
    floraCapColor = 0x38bdf8;
  } else if (planet.type === 'Volcanic') {
    floraStemColor = 0x7f1d1d;
    floraCapColor = 0xf97316;
  } else if (planet.type === 'Toxic') {
    floraStemColor = 0x4d7c0f;
    floraCapColor = 0xa3e635;
  } else if (planet.type === 'Forest') {
    floraStemColor = 0x14532d;
    floraCapColor = 0x4ade80;
  } else if (planet.type === 'Unknown') {
    floraStemColor = 0x6b21a8;
    floraCapColor = 0xc084fc;
  }

  const stemMat = new THREE.MeshStandardMaterial({ color: floraStemColor, roughness: 0.5 });
  const capMat = new THREE.MeshStandardMaterial({
    color: floraCapColor,
    emissive: floraCapColor,
    emissiveIntensity: 0.4,
    roughness: 0.2,
  });

  for (let i = 0; i < floraCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 16 + Math.random() * 110;
    const fx = Math.cos(angle) * dist;
    const fz = Math.sin(angle) * dist;
    const fy = getTerrainHeight(fx, fz);

    const tree = new THREE.Group();
    tree.position.set(fx, fy, fz);

    if (planet.type === 'Ice') {
      // Ice needle spires
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.5 + Math.random() * 3, 6), capMat);
      spire.position.y = 2.5;
      tree.add(spire);
    } else if (planet.type === 'Volcanic') {
      // Basalt column with magma glow tip
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 3.5, 6), stemMat);
      col.position.y = 1.75;
      tree.add(col);
      const ember = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), capMat);
      ember.position.y = 3.6;
      tree.add(ember);
    } else if (planet.type === 'Unknown') {
      // Floating fractal diamond
      const dia = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), capMat);
      dia.position.y = 3.0 + Math.random();
      tree.add(dia);
    } else {
      // Alien mushroom / spire tree
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 3.2, 8), stemMat);
      trunk.position.y = 1.6;
      tree.add(trunk);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), capMat);
      cap.position.y = 3.2;
      tree.add(cap);
    }

    floraGroup.add(tree);
  }
  decorationsGroup.add(floraGroup);

  // 5. Interactive Resource Deposits, Precursor Ruins, and Scannable Nodes
  const nodeDefs: {
    name: string;
    type: InteractableObject['type'];
    category: 'energy' | 'mineral' | 'rare' | 'relic' | 'biological' | 'oxygen';
    resId: string;
    amount: number;
    color: number;
    geo: THREE.BufferGeometry;
    details: InteractableObject['details'];
  }[] = [
    {
      name: 'Resonant Energy Crystal',
      type: 'resource',
      category: 'energy',
      resId: 'energy_crystal',
      amount: 25,
      color: 0x06b6d4,
      geo: new THREE.OctahedronGeometry(0.8),
      details: {
        classification: 'Piezoelectric Crystal Matrix',
        threat: 'None',
        composition: 'High-density coherent ionic lattice',
        origin: 'Natural Geothermal Precipitation',
        notes: 'Can be converted directly into suit thermal shields or ship auxiliary cells.',
      },
    },
    {
      name: 'Titanium Ore Outcrop',
      type: 'resource',
      category: 'mineral',
      resId: 'titanium',
      amount: 2,
      color: 0x94a3b8,
      geo: new THREE.DodecahedronGeometry(0.9),
      details: {
        classification: 'Refined Metallic Vein',
        threat: 'None',
        composition: 'Titanium-Cobalt composite alloy',
        origin: 'Planetary Crust Mineralization',
        notes: 'Critical material for repairing suit integrity and reinforcing hull armor.',
      },
    },
    {
      name: 'Sub-Zero Vapor Vent',
      type: 'resource',
      category: 'oxygen',
      resId: 'pure_water',
      amount: 20,
      color: 0x38bdf8,
      geo: new THREE.CylinderGeometry(0.5, 0.8, 1.2, 8),
      details: {
        classification: 'Cryo-Thermal Condensation Spring',
        threat: 'Low',
        composition: 'Pure Oxygen-Hydrogen compound matrix',
        origin: 'Subterranean Aquifer',
        notes: 'Restores life support atmospheric canisters and replenishes scrubbers.',
      },
    },
    {
      name: 'Precursor Monolith Stele',
      type: 'ruins',
      category: 'relic',
      resId: 'precursor_drive',
      amount: 1,
      color: 0xa855f7,
      geo: new THREE.BoxGeometry(0.9, 3.8, 0.9),
      details: {
        classification: 'Extinct Civil Structural Pylon',
        threat: 'Unknown',
        composition: 'Phase-stabilized Carbon Nanotube Composite',
        origin: 'Pre-Cataclysm Civilization',
        notes: 'Inscribed with star routes and cryptographic historical telemetry.',
      },
    },
    {
      name: 'Luminescent Spore Flora',
      type: 'plant',
      category: 'biological',
      resId: 'bio_chitin',
      amount: 3,
      color: 0x22c55e,
      geo: new THREE.IcosahedronGeometry(0.85),
      details: {
        classification: 'Alien Photosynthetic Biomass',
        threat: 'Low',
        composition: 'Polymerized chlorophyll-resin',
        origin: 'Indigenous Flora',
        notes: 'Rich in organic nutrients and sealing bio-agents for suit patches.',
      },
    },
  ];

  // Distribute 18 interactive nodes across the map within comfortable reach (20m to 90m)
  for (let i = 0; i < 18; i++) {
    const nodeDef = nodeDefs[i % nodeDefs.length];
    const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist = 22 + (i % 3) * 24 + Math.random() * 12;
    const nx = Math.cos(angle) * dist;
    const nz = Math.sin(angle) * dist;
    const ny = getTerrainHeight(nx, nz);

    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(nx, ny + 0.5, nz);

    const nodeMat = new THREE.MeshStandardMaterial({
      color: nodeDef.color,
      emissive: nodeDef.color,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(nodeDef.geo, nodeMat);
    mesh.castShadow = true;
    nodeGroup.add(mesh);

    // Glowing ground aura beacon
    const ringGeo = new THREE.RingGeometry(1.2, 1.4, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: nodeDef.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.05;
    nodeGroup.add(ring);

    // Small light
    const pointLight = new THREE.PointLight(nodeDef.color, 1.5, 8);
    pointLight.position.y = 1.0;
    nodeGroup.add(pointLight);

    interactableMeshes.add(nodeGroup);

    interactables.push({
      id: `node_${planet.id}_${i}`,
      name: nodeDef.name,
      type: nodeDef.type,
      position: [nx, ny + 0.5, nz],
      interacted: false,
      scanned: false,
      resourceReward: {
        id: nodeDef.resId,
        name: nodeDef.name,
        amount: nodeDef.amount,
        category: nodeDef.category,
      },
      details: nodeDef.details,
    });
  }

  // Rare Weapon Cache Spawn (chance ~ 35% on low/med, 75% on high/extreme planets)
  const isDangerous = planet.dangerLevel === 'High' || planet.dangerLevel === 'Extreme';
  const spawnWeapon = Math.random() < (isDangerous ? 0.75 : 0.35);
  if (spawnWeapon) {
    const weaponKeys = Object.keys(WEAPON_TYPES);
    const chosenKey = isDangerous
      ? (Math.random() > 0.4 ? 'arc_rifle' : 'scatter_shot')
      : weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
    const chosenWeapon = WEAPON_TYPES[chosenKey];

    const wAngle = Math.random() * Math.PI * 2;
    const wDist = 26 + Math.random() * 25;
    const wx = Math.cos(wAngle) * wDist;
    const wz = Math.sin(wAngle) * wDist;
    const wy = getTerrainHeight(wx, wz);

    const weaponNode = createWeaponPickupNode(chosenWeapon, [wx, wy, wz]);
    interactableMeshes.add(weaponNode);

    interactables.push({
      id: `weapon_${planet.id}_${chosenWeapon.id}`,
      name: chosenWeapon.name,
      type: 'weapon',
      position: [wx, wy + 0.5, wz],
      interacted: false,
      scanned: false,
      weaponReward: chosenWeapon,
      details: {
        classification: 'Precursor Advanced Firearm',
        threat: 'Lethal',
        composition: 'Ionized Plasma Accelerator Matrix',
        origin: 'Ancient Extinct Garrison',
        notes: chosenWeapon.description,
      },
    });
  }

  // 6. Atmospheric Particle System (floating spores, dust, snow, embers)
  const particleCount = 450;
  const pGeo = new THREE.BufferGeometry();
  const pCoords = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    pCoords[i * 3] = (Math.random() - 0.5) * 160;
    pCoords[i * 3 + 1] = Math.random() * 30;
    pCoords[i * 3 + 2] = (Math.random() - 0.5) * 160;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));

  const pMat = new THREE.PointsMaterial({
    color: new THREE.Color(planet.sunColor),
    size: 0.35,
    transparent: true,
    opacity: 0.6,
  });
  const particles = new THREE.Points(pGeo, pMat);

  // 7. Sky Dome
  const skyGeo = new THREE.SphereGeometry(180, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(planet.skyColor),
    side: THREE.BackSide,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);

  return {
    terrainMesh,
    getTerrainHeight,
    decorationsGroup,
    interactables,
    interactableMeshes,
    particles,
    skyDome,
  };
}
