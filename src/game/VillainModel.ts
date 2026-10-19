import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { soundEngine } from '../audio/SoundEngine';

export interface VillainEntityInstance {
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  isDead: boolean;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead';
  speed: number;
  damage: number;
  attackCooldown: number;
  hasSpottedPlayer: boolean;
  takeDamage: (amount: number) => boolean;
  updateAI: (
    delta: number,
    playerPos: THREE.Vector3,
    getTerrainHeight: (x: number, z: number) => number,
    onPlayerHit: (damage: number) => void
  ) => void;
}

export function createVillain(
  initialPos: [number, number, number],
  onDefeated?: (pos: THREE.Vector3) => void
): VillainEntityInstance {
  const root = new THREE.Group();
  root.name = 'AlienVillain';
  root.position.set(initialPos[0], initialPos[1], initialPos[2]);

  // Model containers
  const characterGroup = new THREE.Group();
  root.add(characterGroup);

  const fallbackGroup = new THREE.Group();
  root.add(fallbackGroup);

  // 1. Fallback procedural menacing alien model
  const alienSkin = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // dark cosmic indigo
    roughness: 0.4,
    metalness: 0.6,
  });
  const redChitin = new THREE.MeshStandardMaterial({
    color: 0x881337,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x4c0519,
    emissiveIntensity: 0.5,
  });
  const glowEyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // Alien Torso & Spines
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.2, 0.6), alienSkin);
  body.position.y = 1.4;
  body.castShadow = true;
  fallbackGroup.add(body);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 6), redChitin);
  head.rotation.x = Math.PI / 2.5;
  head.position.set(0, 2.1, 0.3);
  head.castShadow = true;
  fallbackGroup.add(head);

  // Glowing eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), glowEyeMat);
  eyeL.position.set(-0.16, 2.1, 0.55);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), glowEyeMat);
  eyeR.position.set(0.16, 2.1, 0.55);
  fallbackGroup.add(eyeL);
  fallbackGroup.add(eyeR);

  // Claws
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.1, 6), redChitin);
  armL.rotation.z = 0.4;
  armL.position.set(-0.65, 1.3, 0.2);
  fallbackGroup.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.1, 6), redChitin);
  armR.rotation.z = -0.4;
  armR.position.set(0.65, 1.3, 0.2);
  fallbackGroup.add(armR);

  // Legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.0, 0.3), alienSkin);
  legL.position.set(-0.25, 0.5, 0);
  fallbackGroup.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.0, 0.3), alienSkin);
  legR.position.set(0.25, 0.5, 0);
  fallbackGroup.add(legR);

  // Aura Light
  const auraLight = new THREE.PointLight(0xef4444, 2.5, 10);
  auraLight.position.y = 1.8;
  root.add(auraLight);

  // Floating Health Bar over head
  const hpBgGeo = new THREE.PlaneGeometry(1.6, 0.18);
  const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
  const hpBg = new THREE.Mesh(hpBgGeo, hpBgMat);
  hpBg.position.y = 2.65;
  root.add(hpBg);

  const hpBarGeo = new THREE.PlaneGeometry(1.52, 0.12);
  const hpBarMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
  const hpBar = new THREE.Mesh(hpBarGeo, hpBarMat);
  hpBar.position.set(0, 2.65, 0.01);
  root.add(hpBar);

  // 2. Load Villain GLB Model
  let mixer: THREE.AnimationMixer | null = null;
  let runAction: THREE.AnimationAction | null = null;
  let attackAction: THREE.AnimationAction | null = null;
  let isGlbLoaded = false;

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const urls = ['/models/villain.glb', '/villain (1).glb'];

  function loadGlb(index = 0) {
    if (index >= urls.length) return;
    gltfLoader.load(
      urls[index],
      (gltf) => {
        const model = gltf.scene;
        model.name = 'AlienVillainModel';

        // Set frustumCulled = false so the villain is never culled by Three.js
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = false;
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.5;
              mat.metalness = 0.4;
              mat.needsUpdate = true;
            }
          }
        });

        // Compute model size and scale correctly to 2.4 meters height (intimidating alien overlord)
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        let rawHeight = Math.max(size.y, 0.001);
        if (!isFinite(rawHeight) || rawHeight < 0.0001) {
          rawHeight = 1.0;
        }
        const targetHeight = 2.4;
        let scaleFactor = targetHeight / rawHeight;
        if (!isFinite(scaleFactor) || scaleFactor <= 0) {
          scaleFactor = 1.0;
        }
        model.scale.setScalar(scaleFactor);
        model.updateMatrixWorld(true);

        // Orient Mixamo alien model to face forward (+Z) towards target
        model.rotation.y = Math.PI;

        // Ground feet at y = 0
        const scaledBox = new THREE.Box3().setFromObject(model);
        if (isFinite(scaledBox.min.y) && isFinite(scaledBox.min.x) && isFinite(scaledBox.min.z)) {
          model.position.y = -scaledBox.min.y;
          model.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
          model.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;
        }

        // Setup Animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          // Anim 0: Run / Chase
          const clip0 = gltf.animations[0].clone();
          // Remove forward drift on Hips so it runs in place cleanly
          clip0.tracks.forEach((track) => {
            if (track.name.toLowerCase().includes('hips') && track.name.toLowerCase().endsWith('.position')) {
              const count = track.times.length;
              if (count > 1) {
                const vals = track.values;
                const totalTime = track.times[count - 1] - track.times[0] || 1;
                const startY = vals[1];
                const endY = vals[(count - 1) * 3 + 1];
                const dy = endY - startY;

                const startZ = vals[2];
                const endZ = vals[(count - 1) * 3 + 2];
                const dz = endZ - startZ;

                const startX = vals[0];
                const endX = vals[(count - 1) * 3 + 0];
                const dx = endX - startX;

                for (let i = 0; i < count; i++) {
                  const t = (track.times[i] - track.times[0]) / totalTime;
                  // Mixamo armature local Y is horizontal forward running motion
                  if (Math.abs(dy) > 0.05) {
                    vals[i * 3 + 1] -= dy * t;
                  }
                  if (Math.abs(dz) > 0.1) {
                    vals[i * 3 + 2] -= dz * t;
                  }
                  if (Math.abs(dx) > 0.1) {
                    vals[i * 3 + 0] -= dx * t;
                  }
                }
              }
            }
          });

          runAction = mixer.clipAction(clip0);
          runAction.setLoop(THREE.LoopRepeat, Infinity);
          runAction.play();

          // Anim 1: Attack Slash
          if (gltf.animations.length > 1) {
            const clip1 = gltf.animations[1];
            attackAction = mixer.clipAction(clip1);
            attackAction.setLoop(THREE.LoopOnce, 1);
            attackAction.clampWhenFinished = false;
          }
        }

        characterGroup.add(model);
        fallbackGroup.visible = false;
        isGlbLoaded = true;
      },
      undefined,
      (err) => {
        console.warn(`Error loading Villain GLB from ${urls[index]}:`, err);
        if (index === 0) {
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        }
        loadGlb(index + 1);
      }
    );
  }

  loadGlb(0);

  // 3. AI & Combat Mechanics
  let health = 200;
  const maxHealth = 200;
  let isDead = false;
  let state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead' = 'patrol';
  const speed = 5.8; // Fast, aggressive chase speed
  const damage = 20; // 20 HP = 1 full heart
  let attackCooldown = 0;
  let hasSpottedPlayer = false;
  let patrolAngle = Math.random() * Math.PI * 2;
  let patrolTimer = 3 + Math.random() * 4;
  let damageFlashTimer = 0;

  const takeDamage = (amount: number): boolean => {
    if (isDead) return false;
    health = Math.max(0, health - amount);
    damageFlashTimer = 0.25;
    auraLight.color.set(0xffffff);
    auraLight.intensity = 5;

    // Update HP Bar scale
    const healthPercent = health / maxHealth;
    hpBar.scale.x = Math.max(0.001, healthPercent);
    hpBar.position.x = -(1.52 * (1 - healthPercent)) / 2;

    if (health <= 0) {
      isDead = true;
      state = 'dead';
      hpBg.visible = false;
      hpBar.visible = false;
      auraLight.intensity = 0;
      soundEngine.playAlienDefeated();
      if (onDefeated) onDefeated(root.position.clone());
      return true;
    }

    // Force alert towards player if struck from far away
    hasSpottedPlayer = true;
    state = 'chase';
    soundEngine.playAlienHit();
    return false;
  };

  const updateAI = (
    delta: number,
    playerPos: THREE.Vector3,
    getTerrainHeight: (x: number, z: number) => number,
    onPlayerHit: (dmg: number) => void
  ) => {
    if (isDead) {
      root.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
      return;
    }

    // Flash recovery
    if (damageFlashTimer > 0) {
      damageFlashTimer -= delta;
      if (damageFlashTimer <= 0) {
        auraLight.color.set(0xef4444);
        auraLight.intensity = 2.5;
      }
    }

    // Billboard health bar towards camera
    hpBg.lookAt(playerPos);
    hpBar.lookAt(playerPos);

    // Distance to player
    const distToPlayer = root.position.distanceTo(playerPos);
    const detectionRange = 32.0;
    attackCooldown -= delta;

    if (distToPlayer < detectionRange) {
      if (!hasSpottedPlayer) {
        hasSpottedPlayer = true;
        soundEngine.playVillainRoar();
      }

      if (distToPlayer > 2.4) {
        // Chase player
        state = 'chase';
        const toPlayer = playerPos.clone().sub(root.position);
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetAngle, delta * 8);

        const fwd = new THREE.Vector3(Math.sin(root.rotation.y), 0, Math.cos(root.rotation.y));
        root.position.addScaledVector(fwd, speed * delta);

        if (runAction) {
          runAction.paused = false;
          runAction.timeScale = 1.35;
        }
      } else {
        // Melee attack range!
        state = 'attack';
        const toPlayer = playerPos.clone().sub(root.position);
        root.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);

        if (attackAction && (!attackAction.isRunning() || attackAction.time === 0)) {
          attackAction.reset().play();
        }

        if (attackCooldown <= 0) {
          attackCooldown = 1.25; // 1.25s per strike
          onPlayerHit(damage);
          soundEngine.playPlayerHurt();
        }
      }
    } else {
      // Idle patrol
      state = 'patrol';
      hasSpottedPlayer = false;
      patrolTimer -= delta;
      if (patrolTimer <= 0) {
        patrolTimer = 3 + Math.random() * 4;
        patrolAngle += (Math.random() - 0.5) * 2;
      }
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, patrolAngle, delta * 3);
      const fwd = new THREE.Vector3(Math.sin(root.rotation.y), 0, Math.cos(root.rotation.y));
      root.position.addScaledVector(fwd, speed * 0.4 * delta);

      if (runAction) {
        runAction.timeScale = 0.7;
      }
    }

    // Ground clamp
    const groundY = getTerrainHeight(root.position.x, root.position.z);
    root.position.y = groundY;

    // Update animation mixer
    if (mixer) {
      mixer.update(delta);
    }
  };

  return {
    mesh: root,
    health,
    maxHealth,
    isDead,
    state,
    speed,
    damage,
    attackCooldown,
    hasSpottedPlayer,
    takeDamage,
    updateAI,
  };
}
