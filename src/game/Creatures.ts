import * as THREE from 'three';
import { CreatureEntity } from '../types/game';

export interface CreatureInstance {
  data: CreatureEntity;
  mesh: THREE.Group;
  updateAI: (
    delta: number,
    playerPosition: THREE.Vector3,
    getTerrainHeight: (x: number, z: number) => number
  ) => void;
  playCry: () => void;
}

// 1. Small Peaceful Hopper / Scuttler
export function createHopperCreature(id: string, initialPos: [number, number, number]): CreatureInstance {
  const mesh = new THREE.Group();
  mesh.name = `Creature_${id}`;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x10b981, // bioluminescent jade green
    roughness: 0.4,
    metalness: 0.1,
  });
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x047857,
    roughness: 0.3,
    metalness: 0.3,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), bodyMat);
  body.scale.set(1, 0.7, 1.3);
  body.castShadow = true;
  mesh.add(body);

  // Shell / carapace
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), shellMat);
  shell.scale.set(1.05, 0.8, 1.35);
  shell.position.y = 0.05;
  mesh.add(shell);

  // 4 scuttling legs
  const legGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.4, 6);
  const legs: THREE.Mesh[] = [];
  [
    [-0.3, 0.3],
    [0.3, 0.3],
    [-0.35, -0.3],
    [0.35, -0.3],
  ].forEach(([lx, lz], i) => {
    const leg = new THREE.Mesh(legGeo, shellMat);
    leg.position.set(lx, -0.2, lz);
    leg.rotation.z = lx > 0 ? -0.4 : 0.4;
    mesh.add(leg);
    legs.push(leg);
  });

  // Eyes
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
  e1.position.set(-0.15, 0.15, 0.38);
  const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
  e2.position.set(0.15, 0.15, 0.38);
  mesh.add(e1);
  mesh.add(e2);

  mesh.position.set(initialPos[0], initialPos[1], initialPos[2]);

  const data: CreatureEntity = {
    id,
    name: 'Crystalline Hopper',
    type: 'peaceful',
    position: initialPos,
    rotation: 0,
    speed: 3.5,
    danger: 'Low',
    behavior: 'wander',
    state: 'idle',
    scanned: false,
    description: 'A harmless omnivorous hexapod covered in mineral-infused carapace plates. Highly skittish around strangers.',
    health: 40,
  };

  let hopTimer = 0;
  let targetAngle = Math.random() * Math.PI * 2;
  let stateTimer = 2 + Math.random() * 3;

  const updateAI = (
    delta: number,
    playerPosition: THREE.Vector3,
    getTerrainHeight: (x: number, z: number) => number
  ) => {
    const distToPlayer = mesh.position.distanceTo(playerPosition);

    if (distToPlayer < 7) {
      // Flee from player
      data.behavior = 'flee';
      data.state = 'moving';
      const fleeDir = mesh.position.clone().sub(playerPosition).normalize();
      targetAngle = Math.atan2(fleeDir.x, fleeDir.z);
    } else {
      stateTimer -= delta;
      if (stateTimer <= 0) {
        stateTimer = 3 + Math.random() * 4;
        data.behavior = 'wander';
        data.state = Math.random() > 0.4 ? 'moving' : 'idle';
        targetAngle += (Math.random() - 0.5) * 2;
      }
    }

    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetAngle, delta * 4);

    if (data.state === 'moving') {
      const moveSpeed = data.behavior === 'flee' ? data.speed * 1.6 : data.speed * 0.7;
      hopTimer += delta * (data.behavior === 'flee' ? 12 : 7);

      const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), mesh.rotation.y);
      mesh.position.addScaledVector(fwd, moveSpeed * delta);

      // Hop arc
      const hopOffset = Math.abs(Math.sin(hopTimer)) * 0.35;
      const groundY = getTerrainHeight(mesh.position.x, mesh.position.z);
      mesh.position.y = groundY + 0.3 + hopOffset;

      legs.forEach((leg, idx) => {
        leg.rotation.x = Math.sin(hopTimer + idx) * 0.4;
      });
    } else {
      const groundY = getTerrainHeight(mesh.position.x, mesh.position.z);
      mesh.position.y = groundY + 0.3;
    }

    data.position = [mesh.position.x, mesh.position.y, mesh.position.z];
  };

  return {
    data,
    mesh,
    updateAI,
    playCry: () => {},
  };
}

// 2. Predator Quadruped (Stalker)
export function createPredatorCreature(id: string, initialPos: [number, number, number]): CreatureInstance {
  const mesh = new THREE.Group();
  mesh.name = `Creature_${id}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // dark predatory slate
    roughness: 0.6,
    metalness: 0.4,
  });
  const spineMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // crimson spine crest
    roughness: 0.3,
  });
  const glowEyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // red glowing optics

  // Muscular Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.8), skinMat);
  torso.castShadow = true;
  mesh.add(torso);

  // Dorsal Spines
  for (let i = 0; i < 4; i++) {
    const spine = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 4), spineMat);
    spine.rotation.x = -0.3;
    spine.position.set(0, 0.45, -0.6 + i * 0.4);
    mesh.add(spine);
  }

  // Head & Jaws
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.2, 1.1);
  mesh.add(headGroup);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.7), skinMat);
  headGroup.add(head);

  // Glowing red multi-eyes
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), glowEyeMat);
  e1.position.set(-0.2, 0.1, 0.35);
  const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), glowEyeMat);
  e2.position.set(0.2, 0.1, 0.35);
  headGroup.add(e1);
  headGroup.add(e2);

  // 4 Legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.8, 0.25);
  const legs: THREE.Mesh[] = [];
  [
    [-0.5, 0.6],
    [0.5, 0.6],
    [-0.5, -0.6],
    [0.5, -0.6],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(lx, -0.5, lz);
    mesh.add(leg);
    legs.push(leg);
  });

  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 1.1, 6), skinMat);
  tail.rotation.x = -Math.PI / 3;
  tail.position.set(0, 0.1, -1.2);
  mesh.add(tail);

  mesh.position.set(initialPos[0], initialPos[1], initialPos[2]);

  const data: CreatureEntity = {
    id,
    name: 'Ridge Stalker',
    type: 'predator',
    position: initialPos,
    rotation: 0,
    speed: 4.8,
    danger: 'High',
    behavior: 'stalk',
    state: 'idle',
    scanned: false,
    description: 'An aggressive territorial quadruped equipped with thermographic optical sensors and serrated carbon-plated claws.',
    health: 120,
  };

  let walkTimer = 0;
  let stalkTimer = 0;

  const updateAI = (
    delta: number,
    playerPosition: THREE.Vector3,
    getTerrainHeight: (x: number, z: number) => number
  ) => {
    const distToPlayer = mesh.position.distanceTo(playerPosition);

    if (distToPlayer < 18) {
      // Stalk or approach player cautiously
      data.behavior = 'stalk';
      data.state = 'moving';
      const toPlayer = playerPosition.clone().sub(mesh.position);
      const angle = Math.atan2(toPlayer.x, toPlayer.z);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, angle, delta * 3);

      // Stop at striking distance (~3m) so it doesn't clip directly into player
      if (distToPlayer > 3.2) {
        walkTimer += delta * 6;
        const speed = distToPlayer < 8 ? data.speed * 1.2 : data.speed * 0.7;
        const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), mesh.rotation.y);
        mesh.position.addScaledVector(fwd, speed * delta);
      } else {
        // Growl stance
        stalkTimer += delta * 4;
        headGroup.rotation.x = Math.sin(stalkTimer) * 0.15;
      }
    } else {
      // Wander peacefully nearby
      data.behavior = 'wander';
      walkTimer += delta * 3;
      stalkTimer += delta;
      if (stalkTimer > 5) {
        mesh.rotation.y += (Math.random() - 0.5) * 1.5;
        stalkTimer = 0;
      }
      const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), mesh.rotation.y);
      mesh.position.addScaledVector(fwd, data.speed * 0.3 * delta);
    }

    const groundY = getTerrainHeight(mesh.position.x, mesh.position.z);
    mesh.position.y = groundY + 0.9;

    // Leg walk cycle
    legs[0].rotation.x = Math.sin(walkTimer) * 0.4;
    legs[1].rotation.x = -Math.sin(walkTimer) * 0.4;
    legs[2].rotation.x = -Math.sin(walkTimer) * 0.4;
    legs[3].rotation.x = Math.sin(walkTimer) * 0.4;
    tail.rotation.y = Math.sin(walkTimer * 0.8) * 0.25;

    data.position = [mesh.position.x, mesh.position.y, mesh.position.z];
  };

  return {
    data,
    mesh,
    updateAI,
    playCry: () => {},
  };
}

// 3. Flying Sky Manta / Aether Ray
export function createFlyingCreature(id: string, initialPos: [number, number, number]): CreatureInstance {
  const mesh = new THREE.Group();
  mesh.name = `Creature_${id}`;

  const rayMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });

  const edgeGlowMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
  });

  // Central streamlined body
  const bodyGeo = new THREE.ConeGeometry(0.8, 3.5, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, rayMat);
  mesh.add(body);

  // Broad undulating wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(4.0, -1.0);
  wingShape.lineTo(3.2, -2.5);
  wingShape.lineTo(0, -1.8);
  wingShape.closePath();

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const leftWing = new THREE.Mesh(wingGeo, rayMat);
  leftWing.rotation.x = -Math.PI / 2;
  leftWing.position.set(0.4, 0, 0.5);
  mesh.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, rayMat);
  rightWing.rotation.x = -Math.PI / 2;
  rightWing.scale.x = -1;
  rightWing.position.set(-0.4, 0, 0.5);
  mesh.add(rightWing);

  // Trailing wisps / whip tail
  const tailGeo = new THREE.CylinderGeometry(0.04, 0.01, 4.0, 6);
  tailGeo.rotateX(Math.PI / 2);
  const tail = new THREE.Mesh(tailGeo, edgeGlowMat);
  tail.position.set(0, 0, -2.5);
  mesh.add(tail);

  mesh.position.set(initialPos[0], initialPos[1] + 18, initialPos[2]);

  const data: CreatureEntity = {
    id,
    name: 'Aether Ray',
    type: 'flying',
    position: [mesh.position.x, mesh.position.y, mesh.position.z],
    rotation: 0,
    speed: 7.0,
    danger: 'Low',
    behavior: 'glide',
    state: 'moving',
    scanned: false,
    description: 'A majestic airborne organism that glides along thermal atmospheric slipstreams by generating organic anti-gravitational fields.',
    health: 80,
  };

  let flightTime = Math.random() * 10;
  const orbitCenter = new THREE.Vector3(initialPos[0], initialPos[1] + 16, initialPos[2]);
  const orbitRadius = 25 + Math.random() * 15;

  const updateAI = (delta: number) => {
    flightTime += delta * 0.4;

    const x = orbitCenter.x + Math.cos(flightTime) * orbitRadius;
    const z = orbitCenter.z + Math.sin(flightTime) * orbitRadius;
    const y = orbitCenter.y + Math.sin(flightTime * 2) * 3;

    // Face travel direction
    const nextX = orbitCenter.x + Math.cos(flightTime + 0.05) * orbitRadius;
    const nextZ = orbitCenter.z + Math.sin(flightTime + 0.05) * orbitRadius;
    const angle = Math.atan2(nextX - x, nextZ - z);

    mesh.position.set(x, y, z);
    mesh.rotation.y = angle;
    mesh.rotation.z = Math.sin(flightTime) * 0.2; // Banking turn

    // Wing flap undulation
    const flap = Math.sin(flightTime * 5) * 0.25;
    leftWing.rotation.z = flap;
    rightWing.rotation.z = -flap;

    data.position = [mesh.position.x, mesh.position.y, mesh.position.z];
  };

  return {
    data,
    mesh,
    updateAI,
    playCry: () => {},
  };
}

// 4. Rare Anomalous Entity (Void Luminary)
export function createAnomalyCreature(id: string, initialPos: [number, number, number]): CreatureInstance {
  const mesh = new THREE.Group();
  mesh.name = `Creature_${id}`;

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.8,
  });

  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xe9d5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });

  // Tall floating crystalline obelisk core
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 1), crystalMat);
  core.scale.set(0.6, 2.2, 0.6);
  core.position.y = 2.5;
  mesh.add(core);

  // Surrounding orbiting shards
  const shards: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.35), crystalMat);
    mesh.add(shard);
    shards.push(shard);
  }

  // Harmonic spherical field
  const field = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), auraMat);
  field.position.y = 2.5;
  mesh.add(field);

  // Entity light
  const light = new THREE.PointLight(0xa855f7, 3, 12);
  light.position.y = 2.5;
  mesh.add(light);

  mesh.position.set(initialPos[0], initialPos[1], initialPos[2]);

  const data: CreatureEntity = {
    id,
    name: 'Void Luminary',
    type: 'anomaly',
    position: initialPos,
    rotation: 0,
    speed: 1.5,
    danger: 'Unknown',
    behavior: 'wander',
    state: 'idle',
    scanned: false,
    description: 'A non-biological quantum sentience composed of oscillating crystal matrices. It exists partially phased outside our three spatial dimensions.',
    health: 500,
  };

  let phaseTimer = 0;

  const updateAI = (
    delta: number,
    _playerPos: THREE.Vector3,
    getTerrainHeight: (x: number, z: number) => number
  ) => {
    phaseTimer += delta * 2;

    core.rotation.y += delta * 0.8;
    core.rotation.z = Math.sin(phaseTimer) * 0.1;

    // Orbiting shards
    shards.forEach((shard, idx) => {
      const angle = phaseTimer + (idx * Math.PI * 2) / shards.length;
      shard.position.set(
        Math.cos(angle) * 1.8,
        2.5 + Math.sin(phaseTimer * 1.5 + idx) * 0.6,
        Math.sin(angle) * 1.8
      );
      shard.rotation.x += delta * 2;
    });

    field.rotation.y += delta * 0.3;
    field.rotation.x += delta * 0.2;

    const groundY = getTerrainHeight(mesh.position.x, mesh.position.z);
    mesh.position.y = groundY + Math.sin(phaseTimer) * 0.3;

    data.position = [mesh.position.x, mesh.position.y, mesh.position.z];
  };

  return {
    data,
    mesh,
    updateAI,
    playCry: () => {},
  };
}
