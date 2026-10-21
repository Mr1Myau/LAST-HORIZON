import * as THREE from 'three';
import { soundEngine } from '../audio/SoundEngine';

export interface CompanionPetInstance {
  mesh: THREE.Group;
  isBefriended: boolean;
  name: string;
  befriend: () => void;
  pet: () => void;
  update: (
    delta: number,
    astronautPos: THREE.Vector3,
    isAstronautMoving: boolean,
    isVillainNearby: boolean,
    nearestTreasureDist: number,
    getTerrainHeight: (x: number, z: number) => number
  ) => void;
}

export function createCompanionPet(
  initialPos: [number, number, number]
): CompanionPetInstance {
  const root = new THREE.Group();
  root.name = 'CompanionPet_Aelis';
  root.position.set(initialPos[0], initialPos[1], initialPos[2]);

  let isBefriended = false;
  const name = 'Аэлис (Aelis)';

  // 1. Materials with Dynamic Mood Colors
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    roughness: 0.25,
    metalness: 0.4,
  });

  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
  const antennaOrbMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.75,
    roughness: 0.1,
    side: THREE.DoubleSide,
  });

  // 2. Pet Body Model Components
  const petBodyGroup = new THREE.Group();
  root.add(petBodyGroup);

  // Round celestial body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), bodyMat);
  body.castShadow = true;
  petBodyGroup.add(body);

  // Big expressive eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeWhiteMat);
  eyeL.position.set(-0.13, 0.08, 0.26);
  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), pupilMat);
  pupilL.position.set(-0.13, 0.08, 0.33);
  petBodyGroup.add(eyeL);
  petBodyGroup.add(pupilL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeWhiteMat);
  eyeR.position.set(0.13, 0.08, 0.26);
  const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), pupilMat);
  pupilR.position.set(0.13, 0.08, 0.33);
  petBodyGroup.add(eyeR);
  petBodyGroup.add(pupilR);

  // Glowing antennae with orbs
  const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 6), bodyMat);
  antL.position.set(-0.12, 0.38, 0.05);
  antL.rotation.z = -0.35;
  antL.rotation.x = -0.15;
  const orbL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), antennaOrbMat);
  orbL.position.set(-0.19, 0.48, 0.08);
  petBodyGroup.add(antL);
  petBodyGroup.add(orbL);

  const antR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 6), bodyMat);
  antR.position.set(0.12, 0.38, 0.05);
  antR.rotation.z = 0.35;
  antR.rotation.x = -0.15;
  const orbR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), antennaOrbMat);
  orbR.position.set(0.19, 0.48, 0.08);
  petBodyGroup.add(antR);
  petBodyGroup.add(orbR);

  // Iridescent Fluttering Wings / Fins
  const wingGeo = new THREE.PlaneGeometry(0.35, 0.22);
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.position.set(-0.32, 0.1, -0.05);
  wingL.rotation.y = -Math.PI * 0.25;
  petBodyGroup.add(wingL);

  const wingR = new THREE.Mesh(wingGeo, wingMat);
  wingR.position.set(0.32, 0.1, -0.05);
  wingR.rotation.y = Math.PI * 0.25;
  petBodyGroup.add(wingR);

  // Little energy tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 8), bodyMat);
  tail.position.set(0, -0.12, -0.32);
  tail.rotation.x = -Math.PI * 0.45;
  petBodyGroup.add(tail);

  // Bioluminescent Point Light
  const petLight = new THREE.PointLight(0x22d3ee, 1.8, 12);
  petLight.position.y = 0.2;
  root.add(petLight);

  // 3. Floating Companion Badge / Name Plate
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 64;
  const bCtx = badgeCanvas.getContext('2d')!;
  bCtx.fillStyle = 'rgba(6, 15, 35, 0.75)';
  bCtx.roundRect(10, 8, 236, 48, 16);
  bCtx.fill();
  bCtx.strokeStyle = '#22d3ee';
  bCtx.lineWidth = 3;
  bCtx.stroke();
  bCtx.fillStyle = '#67e8f9';
  bCtx.font = 'bold 22px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText('★ АЭЛИС (LUMI)', 128, 32);

  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  const badgeMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true });
  const badgeSprite = new THREE.Sprite(badgeMat);
  badgeSprite.position.set(0, 0.72, 0);
  badgeSprite.scale.set(1.4, 0.35, 1);
  root.add(badgeSprite);

  // Animation Timers & States
  let animTimer = 0;
  let wingTimer = 0;
  let currentMood: 'calm' | 'danger' | 'treasure' = 'calm';
  let joyFlipTimer = 0;

  const befriend = () => {
    if (isBefriended) return;
    isBefriended = true;
    soundEngine.playCompanionHappy();

    // Flash happy golden/emerald glow
    bodyMat.emissive.setHex(0x10b981);
    antennaOrbMat.color.setHex(0x34d399);
    petLight.color.setHex(0x10b981);
    petLight.intensity = 3.5;
  };

  const pet = () => {
    soundEngine.playCompanionHappy();
    joyFlipTimer = Math.PI * 2; // Full joyful backflip!
  };

  const update = (
    delta: number,
    astronautPos: THREE.Vector3,
    isAstronautMoving: boolean,
    isVillainNearby: boolean,
    nearestTreasureDist: number,
    getTerrainHeight: (x: number, z: number) => number
  ) => {
    animTimer += delta;
    wingTimer += delta * (isAstronautMoving ? 24 : 14);

    // Flutter wings smoothly
    const wingAngle = Math.sin(wingTimer) * 0.45;
    wingL.rotation.z = wingAngle;
    wingR.rotation.z = -wingAngle;

    // Joyful backflip animation when petted or jumping
    if (joyFlipTimer > 0) {
      joyFlipTimer -= delta * 8;
      petBodyGroup.rotation.x = joyFlipTimer;
    } else {
      petBodyGroup.rotation.x = Math.sin(animTimer * 2.5) * 0.1;
    }

    // Mood lighting and sensor detection
    if (isVillainNearby) {
      if (currentMood !== 'danger') {
        currentMood = 'danger';
        soundEngine.playCompanionAlert();
      }
      bodyMat.emissive.setHex(0xef4444);
      antennaOrbMat.color.setHex(0xf87171);
      petLight.color.setHex(0xef4444);
      petLight.intensity = 2.4 + Math.sin(animTimer * 12) * 0.8; // Fast urgent pulsing!
    } else if (nearestTreasureDist < 16.0) {
      currentMood = 'treasure';
      bodyMat.emissive.setHex(0x10b981);
      antennaOrbMat.color.setHex(0x6ee7b7);
      petLight.color.setHex(0x10b981);
      petLight.intensity = 2.0 + Math.sin(animTimer * 6) * 0.5;
    } else {
      currentMood = 'calm';
      bodyMat.emissive.setHex(0x0284c7);
      antennaOrbMat.color.setHex(0x67e8f9);
      petLight.color.setHex(0x22d3ee);
      petLight.intensity = 1.8 + Math.sin(animTimer * 3) * 0.3;
    }

    if (isBefriended) {
      // Follow astronaut faithfully!
      // Hover beside astronaut's right shoulder (offset: right 1.1m, up 1.35m, behind 0.4m)
      const hoverY = Math.sin(animTimer * 3.5) * 0.14;
      const targetPos = astronautPos.clone().add(new THREE.Vector3(1.15, 1.45 + hoverY, -0.2));

      // Ground clamp to prevent sinking
      const groundH = getTerrainHeight(targetPos.x, targetPos.z);
      if (targetPos.y < groundH + 0.6) {
        targetPos.y = groundH + 0.6;
      }

      const followSpeed = isAstronautMoving ? 7.5 : 4.2;
      root.position.lerp(targetPos, delta * followSpeed);

      // Face forward motion direction
      const lookTarget = astronautPos.clone().add(new THREE.Vector3(0, 1.4, 6));
      root.lookAt(lookTarget.x, root.position.y, lookTarget.z);
    } else {
      // Idle floating in initial glade: gentle hover
      const groundY = getTerrainHeight(root.position.x, root.position.z);
      root.position.y = groundY + 1.2 + Math.sin(animTimer * 2.5) * 0.25;
      root.rotation.y += delta * 0.6;
    }
  };

  return {
    mesh: root,
    isBefriended,
    name,
    befriend,
    pet,
    update,
  };
}
