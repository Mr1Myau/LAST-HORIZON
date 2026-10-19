import * as THREE from 'three';
import { WeaponDef } from '../types/game';

export const WEAPON_TYPES: Record<string, WeaponDef> = {
  plasma_blaster: {
    id: 'plasma_blaster',
    name: 'Plasma Pulse Blaster',
    type: 'blaster',
    damage: 35,
    fireRate: 0.28,
    color: 0x38bdf8, // cyan plasma
    heat: 0,
    description: 'Military-grade sidearm firing high-velocity ionized plasma bolts.',
  },
  scatter_shot: {
    id: 'scatter_shot',
    name: 'Ion Scatter Cannon',
    type: 'scatter',
    damage: 65,
    fireRate: 0.65,
    color: 0xa855f7, // purple ion
    heat: 0,
    description: 'Devastating close-range weapon discharging condensed electromagnetic shrapnel.',
  },
  arc_rifle: {
    id: 'arc_rifle',
    name: 'Precursor Quantum Rifle',
    type: 'rifle',
    damage: 100,
    fireRate: 0.9,
    color: 0xfacc15, // gold beam
    heat: 0,
    description: 'Ancient alien relic accelerating stabilized anti-matter spikes at relativistic speed.',
  },
};

export interface Projectile {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  life: number;
  maxLife: number;
}

export function createWeaponMesh(weapon: WeaponDef): THREE.Group {
  const group = new THREE.Group();
  group.name = `Weapon_${weapon.id}`;

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.2,
  });

  const bodyMetal = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: weapon.color,
  });

  // Main chassis / receiver
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.55), bodyMetal);
  group.add(body);

  // Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 12), darkMetal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.04, 0.45);
  group.add(barrel);

  // Glowing energy coils around barrel
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 8, 16), glowMat);
    ring.position.set(0, 0.04, 0.32 + i * 0.1);
    group.add(ring);
  }

  // Handle / Grip
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.12), darkMetal);
  grip.rotation.x = -0.3;
  grip.position.set(0, -0.16, -0.1);
  group.add(grip);

  // Holographic optical scope
  const scope = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.28), darkMetal);
  scope.position.set(0, 0.13, 0.05);
  group.add(scope);

  const scopeLens = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), glowMat);
  scopeLens.position.set(0, 0.13, -0.09);
  group.add(scopeLens);

  // Muzzle light
  const muzzleLight = new THREE.PointLight(weapon.color, 1.2, 3);
  muzzleLight.position.set(0, 0.04, 0.7);
  group.add(muzzleLight);

  return group;
}

export function createWeaponPickupNode(weapon: WeaponDef, pos: [number, number, number]): THREE.Group {
  const group = new THREE.Group();
  group.position.set(pos[0], pos[1], pos[2]);
  group.name = `WeaponPickup_${weapon.id}`;

  // Pedestal / Crushed container base
  const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.35, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.18;
  group.add(base);

  // Floating rotating weapon preview
  const weaponMesh = createWeaponMesh(weapon);
  weaponMesh.scale.setScalar(1.4);
  weaponMesh.position.y = 1.1;
  group.add(weaponMesh);

  // Hologram beacon ring
  const ringGeo = new THREE.RingGeometry(1.0, 1.3, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: weapon.color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.05;
  group.add(ring);

  const beaconLight = new THREE.PointLight(weapon.color, 2.5, 8);
  beaconLight.position.y = 1.2;
  group.add(beaconLight);

  return group;
}
