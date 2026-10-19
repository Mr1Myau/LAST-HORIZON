import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface AstronautRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  characterGroup: THREE.Group;
  isGlbLoaded: boolean;
  animationName: string;
  mixer: THREE.AnimationMixer | null;
  runAction: THREE.AnimationAction | null;
  defaultAction: THREE.AnimationAction | null;
  lookBackAction: THREE.AnimationAction | null;
  activeAnimationType: 'default' | 'look_back';
  animationMode: 'auto' | 'always' | 'idle';
  thrusterLightLeft: THREE.PointLight;
  thrusterLightRight: THREE.PointLight;
  thrusterPlumes: THREE.Mesh[];
  scannerBeam: THREE.Group;
  flashlight: THREE.SpotLight;
  weaponMount: THREE.Group;
  setEquippedWeaponMesh: (mesh: THREE.Group | null) => void;
  setAnimationMode: (mode: 'auto' | 'always' | 'idle') => void;
  setEncounterAlert: (alert: boolean) => void;
  updateAnimation: (
    delta: number,
    isMoving: boolean,
    isRunning: boolean,
    isJumping: boolean,
    isScanning: boolean,
    isEncounteringVillain?: boolean
  ) => void;
}

export function createAstronaut(): AstronautRig {
  const root = new THREE.Group();
  root.name = 'AstronautRoot';

  // 1. Group for custom GLB character model
  const characterGroup = new THREE.Group();
  characterGroup.name = 'GlbCharacterGroup';
  root.add(characterGroup);

  // 2. High-fidelity Fallback Procedural Model (visible while loading and as reliable backup)
  const fallbackBodyGroup = new THREE.Group();
  fallbackBodyGroup.name = 'FallbackBodyGroup';
  root.add(fallbackBodyGroup);

  const suitMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    metalness: 0.85,
    roughness: 0.35,
  });
  const armorPlateMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.9,
    roughness: 0.25,
  });
  const visorMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.95,
    roughness: 0.1,
    emissive: 0x0369a1,
    emissiveIntensity: 0.6,
  });

  // Torso
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 0.42), suitMaterial);
  chest.position.y = 1.25;
  chest.castShadow = true;
  fallbackBodyGroup.add(chest);

  // Helmet & Visor
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 14), suitMaterial);
  head.position.y = 1.75;
  head.castShadow = true;
  fallbackBodyGroup.add(head);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI, 0, Math.PI * 0.7),
    visorMaterial
  );
  visor.rotation.x = Math.PI * 0.15;
  visor.rotation.y = -Math.PI / 2;
  visor.position.set(0, 1.76, 0.08);
  fallbackBodyGroup.add(visor);

  // Limbs
  const fallbackLegs = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.95, 0.28), armorPlateMaterial);
  fallbackLegs.position.y = 0.48;
  fallbackLegs.castShadow = true;
  fallbackBodyGroup.add(fallbackLegs);

  // 3. High-Tech Accessories Mounted on Character (Flashlight, Scanner, Jetpack)
  const accessoriesGroup = new THREE.Group();
  accessoriesGroup.name = 'AstronautAccessories';
  root.add(accessoriesGroup);

  // Flashlight mounted on shoulder
  const flashlight = new THREE.SpotLight(0xffffff, 4, 35, Math.PI * 0.24, 0.4);
  flashlight.position.set(0.2, 1.65, 0.25);
  flashlight.target.position.set(0, 1.5, 10);
  accessoriesGroup.add(flashlight);
  accessoriesGroup.add(flashlight.target);

  // Holographic Scanner Beam
  const scannerBeam = new THREE.Group();
  scannerBeam.position.set(0, 1.35, 0.35);
  scannerBeam.visible = false;
  accessoriesGroup.add(scannerBeam);

  const scanConeGeo = new THREE.ConeGeometry(3.6, 9.5, 16, 1, true);
  const scanConeMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const scanCone = new THREE.Mesh(scanConeGeo, scanConeMat);
  scanCone.rotation.x = -Math.PI / 2;
  scanCone.position.z = 4.75;
  scannerBeam.add(scanCone);

  // Jetpack Thruster Lights & Flames
  const thrusterFlameMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.0,
  });

  const thrusterLightLeft = new THREE.PointLight(0x38bdf8, 0, 4);
  thrusterLightLeft.position.set(-0.25, 1.15, -0.25);
  accessoriesGroup.add(thrusterLightLeft);

  const thrusterLightRight = new THREE.PointLight(0x38bdf8, 0, 4);
  thrusterLightRight.position.set(0.25, 1.15, -0.25);
  accessoriesGroup.add(thrusterLightRight);

  const plumeGeo = new THREE.ConeGeometry(0.08, 0.45, 8);
  plumeGeo.rotateX(Math.PI);
  const plumeLeft = new THREE.Mesh(plumeGeo, thrusterFlameMat);
  plumeLeft.position.set(-0.25, 1.0, -0.25);
  accessoriesGroup.add(plumeLeft);

  const plumeRight = new THREE.Mesh(plumeGeo, thrusterFlameMat);
  plumeRight.position.set(0.25, 1.0, -0.25);
  accessoriesGroup.add(plumeRight);

  const thrusterPlumes = [plumeLeft, plumeRight];

  // Weapon mount attached at right hand position
  const weaponMount = new THREE.Group();
  weaponMount.name = 'AstronautWeaponMount';
  weaponMount.position.set(0.38, 1.05, 0.28);
  accessoriesGroup.add(weaponMount);

  let currentWeaponMesh: THREE.Group | null = null;
  const setEquippedWeaponMesh = (mesh: THREE.Group | null) => {
    if (currentWeaponMesh) {
      weaponMount.remove(currentWeaponMesh);
      currentWeaponMesh = null;
    }
    if (mesh) {
      currentWeaponMesh = mesh;
      weaponMount.add(mesh);
    }
  };

  // 4. Dual Animation and State Management
  let mixer: THREE.AnimationMixer | null = null;
  let defaultAction: THREE.AnimationAction | null = null;
  let lookBackAction: THREE.AnimationAction | null = null;
  let pendingLookBackClip: THREE.AnimationClip | null = null;
  let isGlbLoaded = false;
  let animationName = 'untitled (default)';
  let animationMode: 'auto' | 'always' | 'idle' = 'auto';
  let currentActionType: 'default' | 'look_back' = 'default';
  let isEncounterAlert = false;

  // Configure DRACO Loader with local path first
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  // Helper function to remove Mixamo linear hip drift (Y is forward running axis in Mixamo coordinate system)
  function makeInPlaceClip(rawClip: THREE.AnimationClip, clipName: string): THREE.AnimationClip {
    const inPlaceClip = rawClip.clone();
    inPlaceClip.name = clipName;

    inPlaceClip.tracks.forEach((track) => {
      if (
        track.name.toLowerCase().includes('hips') &&
        track.name.toLowerCase().endsWith('.position')
      ) {
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
            // Mixamo Armature has -90 deg X rotation, so local Y is world forward!
            if (Math.abs(dy) > 0.04) {
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

    return inPlaceClip;
  }

  // 1. Load Primary Character Model with DEFAULT walk/run animation from untitled (1).glb
  const defaultModelUrls = [
    '/untitled (1).glb',
    '/models/default_character.glb',
    '/models/untitled.glb',
  ];

  function tryLoadDefaultModel(index = 0) {
    if (index >= defaultModelUrls.length) {
      console.log('Using stylized astronaut character rig fallback for default model.');
      return;
    }

    const url = defaultModelUrls[index];
    gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.name = 'DefaultAstronautCharacter';

        // Set frustumCulled = false on all SkinnedMeshes to prevent model disappearing
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = false;
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat.map) {
                mat.map.colorSpace = THREE.SRGBColorSpace;
              }
              mat.roughness = 0.55;
              mat.metalness = 0.35;
              mat.depthWrite = true;
              mat.needsUpdate = true;
            }
          }
        });

        // Compute size and scale to 1.95 meters
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        let rawHeight = Math.max(size.y, 0.001);
        if (!isFinite(rawHeight) || rawHeight < 0.0001) {
          rawHeight = 1.0;
        }
        const targetHeight = 1.95;
        let scaleFactor = targetHeight / rawHeight;
        if (!isFinite(scaleFactor) || scaleFactor <= 0) {
          scaleFactor = 1.0;
        }
        model.scale.setScalar(scaleFactor);
        model.updateMatrixWorld(true);

        // Face forward (+Z) in sync with camera and flashlight
        model.rotation.y = Math.PI;

        // Ground feet at y = 0
        const scaledBox = new THREE.Box3().setFromObject(model);
        if (isFinite(scaledBox.min.y) && isFinite(scaledBox.min.x) && isFinite(scaledBox.min.z)) {
          model.position.y = -scaledBox.min.y;
          model.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
          model.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;
        }

        // Initialize Animation Mixer
        mixer = new THREE.AnimationMixer(model);

        // Process default walk/run clip
        if (gltf.animations && gltf.animations.length > 0) {
          const rawClip = gltf.animations[0];
          animationName = 'untitled (default)';
          const inPlaceClip = makeInPlaceClip(rawClip, 'InPlaceDefaultWalk');

          defaultAction = mixer.clipAction(inPlaceClip);
          defaultAction.setLoop(THREE.LoopRepeat, Infinity);
          defaultAction.clampWhenFinished = false;
          defaultAction.setEffectiveWeight(1.0);
          defaultAction.play();
          defaultAction.paused = true; // Wait for player movement
        }

        // If look-back clip was loaded before mixer was ready, bind it now!
        if (pendingLookBackClip) {
          lookBackAction = mixer.clipAction(pendingLookBackClip);
          lookBackAction.setLoop(THREE.LoopRepeat, Infinity);
          lookBackAction.clampWhenFinished = false;
          lookBackAction.setEffectiveWeight(0.0);
          lookBackAction.play();
          lookBackAction.paused = true;
          pendingLookBackClip = null;
        }

        characterGroup.add(model);
        fallbackBodyGroup.visible = false;
        isGlbLoaded = true;
      },
      undefined,
      (err) => {
        console.warn(`Error loading default GLB from ${url}:`, err);
        if (index === 0) {
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        }
        tryLoadDefaultModel(index + 1);
      }
    );
  }

  tryLoadDefaultModel(0);

  // 2. Load "Run Look Back" Animation (plays ONLY when encountering the alien villain)
  const lookBackUrls = [
    '/run look back.compressed.glb',
    '/models/run_look_back.glb',
    '/models/character.glb',
  ];

  function tryLoadLookBackAnim(index = 0) {
    if (index >= lookBackUrls.length) return;

    const url = lookBackUrls[index];
    gltfLoader.load(
      url,
      (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          const inPlaceLookBack = makeInPlaceClip(gltf.animations[0], 'InPlaceRunLookBack');
          if (mixer) {
            lookBackAction = mixer.clipAction(inPlaceLookBack);
            lookBackAction.setLoop(THREE.LoopRepeat, Infinity);
            lookBackAction.clampWhenFinished = false;
            lookBackAction.setEffectiveWeight(0.0);
            lookBackAction.play();
            lookBackAction.paused = true;
          } else {
            pendingLookBackClip = inPlaceLookBack;
          }
        }
      },
      undefined,
      () => {
        tryLoadLookBackAnim(index + 1);
      }
    );
  }

  tryLoadLookBackAnim(0);

  // 5. Animation Update Controller
  let fallbackTimer = 0;

  const setAnimationMode = (mode: 'auto' | 'always' | 'idle') => {
    animationMode = mode;
  };

  const setEncounterAlert = (alert: boolean) => {
    isEncounterAlert = alert;
  };

  const updateAnimation = (
    delta: number,
    isMoving: boolean,
    isRunning: boolean,
    isJumping: boolean,
    isScanning: boolean,
    isEncounteringVillain?: boolean
  ) => {
    // Scanner visualization
    scannerBeam.visible = isScanning;
    if (isScanning) {
      scanCone.rotation.z += delta * 2.5;
    }

    // Jetpack thruster lighting
    if (isJumping) {
      thrusterLightLeft.intensity = 2.5;
      thrusterLightRight.intensity = 2.5;
      thrusterFlameMat.opacity = 0.85;
    } else {
      thrusterLightLeft.intensity = 0;
      thrusterLightRight.intensity = 0;
      thrusterFlameMat.opacity = 0;
    }

    // Encounter alert status: active if explicitly passed or set via encounter flag
    const inEncounter = Boolean(isEncounteringVillain || isEncounterAlert);

    // If custom GLB model is loaded
    if (isGlbLoaded && mixer) {
      // Determine desired action: look-back animation only during alien encounter!
      const targetAction =
        inEncounter && lookBackAction ? lookBackAction : defaultAction;
      const otherAction =
        targetAction === lookBackAction ? defaultAction : lookBackAction;

      const targetActionType = targetAction === lookBackAction ? 'look_back' : 'default';

      // Smooth cross-fade between default and look-back when encounter status changes
      if (currentActionType !== targetActionType && targetAction && otherAction) {
        currentActionType = targetActionType;
        targetAction.reset();
        targetAction.setEffectiveWeight(1.0);
        targetAction.play();
        otherAction.crossFadeTo(targetAction, 0.25, true);
      }

      const activeAction = targetAction || defaultAction;

      const shouldPlay =
        animationMode === 'always' || (animationMode === 'auto' && isMoving);

      if (shouldPlay && activeAction) {
        activeAction.paused = false;
        // Zero delay: immediate brisk playback speed on movement start!
        // Default jog is ~1.2x, sprint is ~1.55x. Look back is ~1.35x.
        const targetSpeed = isRunning ? 1.55 : 1.18;
        activeAction.timeScale = targetSpeed;
        activeAction.setEffectiveWeight(1.0);
        mixer.update(delta);
      } else if (activeAction) {
        // Immediately halt when stopped walking: no sluggish lag or slow-motion stutter
        activeAction.timeScale = 0;
        activeAction.paused = true;
      }
    } else {
      // Fallback procedural animation while model loads
      fallbackTimer += delta * (isRunning ? 11 : isMoving ? 7 : 2);
      if (isMoving) {
        fallbackBodyGroup.position.y = Math.abs(Math.sin(fallbackTimer * 2)) * 0.06;
        fallbackBodyGroup.rotation.y = Math.sin(fallbackTimer) * 0.08;
      } else {
        fallbackBodyGroup.position.y = Math.sin(fallbackTimer * 0.8) * 0.02;
        fallbackBodyGroup.rotation.y = 0;
      }
    }
  };

  return {
    root,
    bodyGroup: fallbackBodyGroup,
    characterGroup,
    isGlbLoaded,
    animationName,
    mixer,
    runAction: defaultAction,
    defaultAction,
    lookBackAction,
    activeAnimationType: currentActionType,
    animationMode,
    thrusterLightLeft,
    thrusterLightRight,
    thrusterPlumes,
    scannerBeam,
    flashlight,
    weaponMount,
    setEquippedWeaponMesh,
    setAnimationMode,
    setEncounterAlert,
    updateAnimation,
  };
}
