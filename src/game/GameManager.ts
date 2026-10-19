import * as THREE from 'three';
import {
  PlanetDef,
  SuitStatus,
  ShipStatus,
  InteractableObject,
  CreatureEntity,
  GameState,
} from '../types/game';
import { PLANETS } from './PlanetData';
import { createAstronaut, AstronautRig } from './AstronautModel';
import { createSpaceship, SpaceshipRig } from './SpaceshipModel';
import {
  buildPlanetEnvironment,
  TerrainResult,
} from './TerrainGenerator';
import {
  createHopperCreature,
  createPredatorCreature,
  createFlyingCreature,
  createAnomalyCreature,
  CreatureInstance,
} from './Creatures';
import {
  createSolarSystemScene,
  SolarSystemVisuals,
  createDestroyedHomeworld,
} from './Cinematics';
import { soundEngine } from '../audio/SoundEngine';
import { createVillain, VillainEntityInstance } from './VillainModel';
import { WEAPON_TYPES, createWeaponMesh, Projectile } from './WeaponSystem';
import { WeaponDef } from '../types/game';

export interface GameCallbacks {
  onSuitUpdate: (suit: SuitStatus) => void;
  onShipUpdate: (ship: ShipStatus) => void;
  onStateChange: (state: GameState) => void;
  onInteractPrompt: (prompt: string | null) => void;
  onScanResult: (target: InteractableObject | CreatureEntity | null) => void;
  onTriggerEvent: (eventId: string) => void;
  onPlanetChange: (planet: PlanetDef) => void;
  onResourceCollected: (name: string, amount: number) => void;
}

export class GameManager {
  private container: HTMLElement;
  private callbacks: GameCallbacks;

  // Three.js Core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private planetLight: THREE.PointLight;

  // Active Planet & Environment
  public currentPlanet: PlanetDef;
  private terrainResult: TerrainResult | null = null;
  private creatures: CreatureInstance[] = [];

  // Entities
  public astronaut: AstronautRig;
  public spaceship: SpaceshipRig;
  private solarSystem: SolarSystemVisuals | null = null;
  private destroyedHomeworld: { group: THREE.Group; update: (d: number) => void } | null = null;

  // Player State & Physics
  private playerPos = new THREE.Vector3(0, 0, 5);
  private playerVel = new THREE.Vector3(0, 0, 0);
  private playerRotation = 0;
  private isGrounded = true;
  private jumpCooldown = 0;
  private footstepTimer = 0;

  // Camera Settings
  private cameraDistance = 4.8;
  private cameraPitch = 0.28; // Up/down angle
  private cameraYaw = 0; // Left/right orbit angle
  private isPointerLocked = false;
  private isDraggingMouse = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  // Game Logic States
  public gameState: GameState = 'intro';
  public villain: VillainEntityInstance | null = null;
  private projectiles: Projectile[] = [];
  private weaponCooldown = 0;
  private dragStartX = 0;
  private dragStartY = 0;

  public suit: SuitStatus = {
    health: 100,
    maxHealth: 100,
    energy: 100,
    integrity: 100,
    lifeSupport: 100,
    isScanning: false,
    hazardWarning: null,
    flashlight: false,
    weapon: null,
  };
  public ship: ShipStatus = {
    integrity: 100,
    fuel: 85,
    warpDriveReady: true,
    cargoCapacity: 120,
  };

  // Input Mapping
  private keys: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public mobileActions = { jump: false, interact: false, scan: false };

  // Cinematic Flight Tracker
  private flightTimer = 0;
  private flightDuration = 5.0; // 5 seconds cinematic hyperspace
  private targetPlanetForFlight: PlanetDef | null = null;
  private flightShipGroup: THREE.Group | null = null;
  private warpStars: THREE.Points | null = null;

  // Raycasting for target detection
  private raycaster = new THREE.Raycaster();

  private animFrameId: number | null = null;
  private isDisposed = false;

  constructor(container: HTMLElement, callbacks: GameCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentPlanet = PLANETS.velora;

    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030712);

    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // 2. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // 3. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    this.dirLight.position.set(40, 80, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 200;
    this.dirLight.shadow.camera.left = -50;
    this.dirLight.shadow.camera.right = 50;
    this.dirLight.shadow.camera.top = 50;
    this.dirLight.shadow.camera.bottom = -50;
    this.scene.add(this.dirLight);

    this.planetLight = new THREE.PointLight(0x38bdf8, 1.0, 50);
    this.planetLight.position.set(0, 15, 0);
    this.scene.add(this.planetLight);

    // 4. Construct Models
    this.astronaut = createAstronaut();
    this.scene.add(this.astronaut.root);

    this.spaceship = createSpaceship();
    this.spaceship.root.position.set(0, 0, 0);
    this.scene.add(this.spaceship.root);

    // 5. Setup Input Handlers
    this.setupInputs();

    // 6. Build Initial Environment (Velora)
    this.loadPlanet(this.currentPlanet, false);

    // Start render loop
    this.startLoop();
  }

  // Input Listeners
  private setupInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);

    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
      this.isDraggingMouse = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });

    window.addEventListener('mouseup', (e) => {
      this.isDraggingMouse = false;
      const dist = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY);
      if (dist < 8 && e.button === 0 && this.gameState === 'planet_surface') {
        if (this.suit.weapon) {
          this.fireWeapon();
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      // Natural camera controls: dragging right rotates camera right, dragging up tilts up
      if (this.isPointerLocked) {
        this.cameraYaw -= e.movementX * 0.003;
        this.cameraPitch = THREE.MathUtils.clamp(
          this.cameraPitch - e.movementY * 0.003,
          -0.3,
          1.2
        );
      } else if (this.isDraggingMouse) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        this.cameraYaw -= dx * 0.004;
        this.cameraPitch = THREE.MathUtils.clamp(
          this.cameraPitch - dy * 0.004,
          -0.3,
          1.2
        );
      }
    });

    canvas.addEventListener('wheel', (e) => {
      this.cameraDistance = THREE.MathUtils.clamp(
        this.cameraDistance + e.deltaY * 0.005,
        2.5,
        9.0
      );
    });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'KeyE') {
      this.triggerInteraction();
    }
    if (e.code === 'KeyF') {
      this.triggerScanner();
    }
    if (e.code === 'KeyL') {
      this.toggleFlashlight();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public lockPointer() {
    this.renderer.domElement.requestPointerLock?.();
    this.isPointerLocked = true;
  }

  public unlockPointer() {
    document.exitPointerLock?.();
    this.isPointerLocked = false;
  }

  // Planet Loading & Clean-up
  public loadPlanet(planet: PlanetDef, spawnNearShip: boolean = true) {
    this.currentPlanet = planet;

    // Clean up old terrain & flora
    if (this.terrainResult) {
      this.scene.remove(this.terrainResult.terrainMesh);
      this.scene.remove(this.terrainResult.decorationsGroup);
      this.scene.remove(this.terrainResult.interactableMeshes);
      this.scene.remove(this.terrainResult.particles);
      this.scene.remove(this.terrainResult.skyDome);
    }

    // Clean up old creatures & villain
    this.creatures.forEach((c) => this.scene.remove(c.mesh));
    this.creatures = [];

    if (this.villain) {
      this.scene.remove(this.villain.mesh);
      this.villain = null;
    }
    soundEngine.stopChaseMusic();

    // Clean up any remaining projectiles
    this.projectiles.forEach((p) => {
      this.scene.remove(p.mesh);
      this.scene.remove(p.light);
      p.mesh.geometry.dispose();
    });
    this.projectiles = [];

    // Build new terrain
    this.terrainResult = buildPlanetEnvironment(planet);
    this.scene.add(this.terrainResult.terrainMesh);
    this.scene.add(this.terrainResult.decorationsGroup);
    this.scene.add(this.terrainResult.interactableMeshes);
    this.scene.add(this.terrainResult.particles);
    this.scene.add(this.terrainResult.skyDome);

    // Adjust Scene Fog & Lighting for planetary atmosphere
    this.scene.fog = new THREE.FogExp2(new THREE.Color(planet.fogColor), 0.012);
    this.dirLight.color.set(planet.sunColor);
    this.dirLight.intensity = planet.lightIntensity;
    this.ambientLight.color.set(planet.skyColor);

    // Spawn spaceship on landing pad (at origin)
    this.spaceship.root.position.set(0, 0, 0);

    // Position Astronaut
    if (spawnNearShip) {
      this.playerPos.set(0, 0.2, 5.0);
      this.playerVel.set(0, 0, 0);
      this.cameraYaw = 0;
    }

    // Spawn 4 Alien Creatures
    const c1 = createHopperCreature('creature_hopper_1', [14, 0, -18]);
    const c2 = createPredatorCreature('creature_stalker_1', [-28, 0, 22]);
    const c3 = createFlyingCreature('creature_ray_1', [0, 0, 0]);
    const c4 = createAnomalyCreature('creature_anomaly_1', [35, 0, 35]);

    this.creatures = [c1, c2, c3, c4];
    this.creatures.forEach((c) => this.scene.add(c.mesh));

    // Spawn Alien Villain on dangerous planets (Korvan, Vanta, Orion-9, Unknown-01, or High/Extreme threat)
    const isDangerousWorld =
      planet.dangerLevel === 'High' ||
      planet.dangerLevel === 'Extreme' ||
      planet.id === 'korvan' ||
      planet.id === 'vanta' ||
      planet.id === 'orion-9' ||
      planet.id === 'unknown-01' ||
      planet.dangerLevel === 'Moderate';

    if (isDangerousWorld) {
      const vDist = 28;
      const vAngle = Math.PI * 0.35;
      const vx = Math.cos(vAngle) * vDist;
      const vz = Math.sin(vAngle) * vDist;
      const vy = this.terrainResult.getTerrainHeight(vx, vz);

      this.villain = createVillain([vx, vy, vz], (defeatPos) => {
        this.handleVillainDefeated(defeatPos);
      });
      this.scene.add(this.villain.mesh);
    }

    // Audio ambience
    soundEngine.startAmbient(planet.type.toLowerCase());
    this.callbacks.onPlanetChange(planet);
  }

  // Switch to Opening Intro Cinematic
  public startIntroCinematic() {
    this.gameState = 'intro';
    this.callbacks.onStateChange('intro');

    // Create 3D Destroyed Homeworld
    if (!this.destroyedHomeworld) {
      this.destroyedHomeworld = createDestroyedHomeworld();
      this.scene.add(this.destroyedHomeworld.group);
    }
    this.destroyedHomeworld.group.visible = true;

    // Hide surface entities
    this.astronaut.root.visible = false;
    this.spaceship.root.visible = false;
    if (this.terrainResult) {
      this.terrainResult.terrainMesh.visible = false;
      this.terrainResult.decorationsGroup.visible = false;
      this.terrainResult.interactableMeshes.visible = false;
    }

    // Position cinematic camera
    this.camera.position.set(0, 5, 28);
    this.camera.lookAt(0, 0, 0);
  }

  // Finish Intro & Enter Game
  public finishIntro() {
    if (this.destroyedHomeworld) {
      this.scene.remove(this.destroyedHomeworld.group);
      this.destroyedHomeworld = null;
    }

    this.astronaut.root.visible = true;
    this.spaceship.root.visible = true;
    if (this.terrainResult) {
      this.terrainResult.terrainMesh.visible = true;
      this.terrainResult.decorationsGroup.visible = true;
      this.terrainResult.interactableMeshes.visible = true;
    }

    this.gameState = 'planet_surface';
    this.callbacks.onStateChange('planet_surface');
    this.loadPlanet(PLANETS.velora, true);
  }

  // Open Solar System Space Navigation (when inside ship)
  public openSpaceNavigation() {
    this.gameState = 'space_nav';
    this.callbacks.onStateChange('space_nav');

    if (!this.solarSystem) {
      this.solarSystem = createSolarSystemScene();
      this.scene.add(this.solarSystem.group);
    }
    this.solarSystem.group.visible = true;

    // Hide surface
    this.astronaut.root.visible = false;
    this.spaceship.root.visible = false;
    if (this.terrainResult) {
      this.terrainResult.terrainMesh.visible = false;
      this.terrainResult.decorationsGroup.visible = false;
      this.terrainResult.interactableMeshes.visible = false;
      this.terrainResult.particles.visible = false;
      this.terrainResult.skyDome.visible = false;
    }

    // Overhead tactical camera
    this.camera.position.set(0, 85, 95);
    this.camera.lookAt(0, 0, 0);
  }

  // Close Space Navigation & return to current planet surface
  public exitSpaceNavigation() {
    if (this.solarSystem) {
      this.solarSystem.group.visible = false;
    }
    this.astronaut.root.visible = true;
    this.spaceship.root.visible = true;
    if (this.terrainResult) {
      this.terrainResult.terrainMesh.visible = true;
      this.terrainResult.decorationsGroup.visible = true;
      this.terrainResult.interactableMeshes.visible = true;
      this.terrainResult.particles.visible = true;
      this.terrainResult.skyDome.visible = true;
    }

    this.gameState = 'planet_surface';
    this.callbacks.onStateChange('planet_surface');
  }

  // Initiate Cinematic Hyperspace Flight to a new planet
  public startFlightCinematic(targetPlanet: PlanetDef) {
    if (this.ship.fuel < 10) {
      soundEngine.playHazardWarning();
      return false;
    }

    // Deduct fuel
    this.ship.fuel = Math.max(0, this.ship.fuel - 15);
    this.callbacks.onShipUpdate(this.ship);

    this.gameState = 'cinematic_flight';
    this.callbacks.onStateChange('cinematic_flight');
    this.targetPlanetForFlight = targetPlanet;
    this.flightTimer = 0;

    if (this.solarSystem) {
      this.solarSystem.group.visible = false;
    }

    // Build warp starfield & flying ship group
    if (!this.flightShipGroup) {
      this.flightShipGroup = new THREE.Group();
      const miniShip = createSpaceship();
      miniShip.setThrusterPower(1.0);
      this.flightShipGroup.add(miniShip.root);
      this.scene.add(this.flightShipGroup);
    }
    this.flightShipGroup.visible = true;
    this.flightShipGroup.position.set(0, 0, 0);
    this.flightShipGroup.rotation.set(0, 0, 0);

    // Create warp streak stars
    if (!this.warpStars) {
      const warpCount = 600;
      const warpGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(warpCount * 3);
      for (let i = 0; i < warpCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      warpGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const warpMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 1.5,
        transparent: true,
        opacity: 0.9,
      });
      this.warpStars = new THREE.Points(warpGeo, warpMat);
      this.scene.add(this.warpStars);
    }
    this.warpStars.visible = true;

    // Hide astronaut & ground
    this.astronaut.root.visible = false;
    this.spaceship.root.visible = false;
    if (this.terrainResult) {
      this.terrainResult.terrainMesh.visible = false;
      this.terrainResult.decorationsGroup.visible = false;
      this.terrainResult.interactableMeshes.visible = false;
      this.terrainResult.particles.visible = false;
      this.terrainResult.skyDome.visible = false;
    }

    soundEngine.playShipLaunch();
    return true;
  }

  // Update Flight Cinematic
  private updateFlightCinematic(delta: number) {
    this.flightTimer += delta;
    const progress = this.flightTimer / this.flightDuration;

    // Animate warp stars flying past camera
    if (this.warpStars) {
      const posAttr = this.warpStars.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let z = posAttr.getZ(i);
        z += delta * 120;
        if (z > 80) z = -120;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;
    }

    // Camera follow ship with subtle cinematic wobble
    if (this.flightShipGroup) {
      this.flightShipGroup.rotation.z = Math.sin(this.flightTimer * 2) * 0.15;
      this.flightShipGroup.rotation.x = Math.sin(this.flightTimer * 1.5) * 0.08;
      this.camera.position.set(
        Math.sin(this.flightTimer) * 2,
        4 + Math.sin(this.flightTimer * 3) * 0.5,
        -12
      );
      this.camera.lookAt(this.flightShipGroup.position);
    }

    if (progress >= 1.0 && this.targetPlanetForFlight) {
      // Flight complete! Touch down on new planet!
      if (this.flightShipGroup) this.flightShipGroup.visible = false;
      if (this.warpStars) this.warpStars.visible = false;

      this.astronaut.root.visible = true;
      this.spaceship.root.visible = true;

      this.loadPlanet(this.targetPlanetForFlight, true);
      this.gameState = 'planet_surface';
      this.callbacks.onStateChange('planet_surface');

      // Random story event check upon landing
      if (Math.random() > 0.4) {
        setTimeout(() => {
          this.callbacks.onTriggerEvent(
            this.targetPlanetForFlight?.hazards.includes('toxic')
              ? 'evt_acid_surge'
              : 'evt_homeworld_echo'
          );
        }, 1500);
      }
    }
  }

  // Scanner Pulse Trigger (F key)
  public triggerScanner() {
    this.suit.isScanning = true;
    this.callbacks.onSuitUpdate(this.suit);
    soundEngine.playScanner();

    // Find nearest object or creature within 24m
    let nearestTarget: InteractableObject | CreatureEntity | null = null;
    let minDistance = 25;

    // Check interactables
    if (this.terrainResult) {
      this.terrainResult.interactables.forEach((item) => {
        const dist = this.playerPos.distanceTo(
          new THREE.Vector3(item.position[0], item.position[1], item.position[2])
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestTarget = item;
          item.scanned = true;
        }
      });
    }

    // Check creatures
    this.creatures.forEach((c) => {
      const dist = this.playerPos.distanceTo(c.mesh.position);
      if (dist < minDistance) {
        minDistance = dist;
        c.data.scanned = true;
        nearestTarget = c.data;
      }
    });

    this.callbacks.onScanResult(nearestTarget);

    setTimeout(() => {
      this.suit.isScanning = false;
      this.callbacks.onSuitUpdate(this.suit);
    }, 1800);
  }

  // Interaction Trigger (E key)
  public triggerInteraction() {
    // Check if near Spaceship Boarding Ramp (at origin [0, 0, 3.8])
    const distToRamp = this.playerPos.distanceTo(new THREE.Vector3(0, 0, 3.8));
    if (distToRamp < 4.2) {
      soundEngine.playUiClick();
      this.openSpaceNavigation();
      return;
    }

    // Check nearest interactive node
    if (this.terrainResult) {
      for (const item of this.terrainResult.interactables) {
        const itemPos = new THREE.Vector3(item.position[0], item.position[1], item.position[2]);
        const dist = this.playerPos.distanceTo(itemPos);

        if (dist < 4.5 && !item.interacted) {
          item.interacted = true;

          // If this is a weapon pickup
          if (item.type === 'weapon' && item.weaponReward) {
            this.equipWeapon(item.weaponReward);
            const meshGroup = this.terrainResult.interactableMeshes.children.find(
              (g) => g.position.distanceTo(itemPos) < 1.2
            );
            if (meshGroup) meshGroup.visible = false;
            break;
          }

          soundEngine.playCollect();

          // Award resource
          if (item.resourceReward) {
            this.callbacks.onResourceCollected(
              item.resourceReward.name,
              item.resourceReward.amount
            );

            // Recharge suit if energy or water
            if (item.resourceReward.category === 'energy') {
              this.suit.energy = Math.min(100, this.suit.energy + 25);
            } else if (item.resourceReward.category === 'oxygen') {
              this.suit.lifeSupport = Math.min(100, this.suit.lifeSupport + 25);
              // Medical / oxygen node also restores 1 full heart
              this.suit.health = Math.min(100, this.suit.health + 20);
            }
            this.callbacks.onSuitUpdate(this.suit);
          }

          // Trigger special story event if it is an ancient ruin or relic
          if (item.type === 'ruins') {
            this.callbacks.onTriggerEvent('evt_ancient_monolith');
          }

          // Visual feedback: shrink or dim node
          const meshGroup = this.terrainResult.interactableMeshes.children.find(
            (g) => g.position.distanceTo(itemPos) < 1.0
          );
          if (meshGroup) {
            meshGroup.scale.set(0.3, 0.3, 0.3);
          }
          break;
        }
      }
    }
  }

  // Equip weapon on astronaut and suit telemetry
  public equipWeapon(weapon: WeaponDef) {
    this.suit.weapon = weapon;
    soundEngine.playWeaponEquip();

    const weaponMesh = createWeaponMesh(weapon);
    this.astronaut.setEquippedWeaponMesh(weaponMesh);
    this.callbacks.onSuitUpdate(this.suit);
    this.callbacks.onInteractPrompt(`EQUIPPED: ${weapon.name.toUpperCase()}`);
  }

  // Fire equipped weapon projectile towards camera target
  public fireWeapon() {
    if (!this.suit.weapon || this.weaponCooldown > 0 || this.gameState !== 'planet_surface') {
      return;
    }

    this.weaponCooldown = this.suit.weapon.fireRate;
    soundEngine.playBlasterFire();

    // Aim forward based on camera yaw & pitch
    const aimDir = new THREE.Vector3(
      Math.sin(this.cameraYaw),
      -Math.sin(this.cameraPitch) * 0.4,
      Math.cos(this.cameraYaw)
    ).normalize();

    const muzzlePos = this.playerPos
      .clone()
      .add(new THREE.Vector3(0, 1.25, 0))
      .addScaledVector(aimDir, 0.7);

    // Glowing energy projectile mesh
    const projGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.55, 6);
    projGeo.rotateX(Math.PI / 2);
    const projMat = new THREE.MeshBasicMaterial({ color: this.suit.weapon.color });
    const projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.copy(muzzlePos);
    projMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), aimDir);
    this.scene.add(projMesh);

    const projLight = new THREE.PointLight(this.suit.weapon.color, 2.5, 6);
    projLight.position.copy(muzzlePos);
    this.scene.add(projLight);

    this.projectiles.push({
      mesh: projMesh,
      light: projLight,
      position: muzzlePos,
      velocity: aimDir.clone().multiplyScalar(46),
      damage: this.suit.weapon.damage,
      life: 2.5,
      maxLife: 2.5,
    });
  }

  // Player damaged by villain strike or hostile hazard
  public handlePlayerDamage(damage: number) {
    if (this.suit.health <= 0) return;
    this.suit.health = Math.max(0, this.suit.health - damage);
    this.suit.integrity = Math.max(0, this.suit.integrity - damage * 0.4);
    soundEngine.playPlayerHurt();
    this.callbacks.onSuitUpdate(this.suit);

    // If health drops to 0: emergency recovery back to ship
    if (this.suit.health <= 0) {
      this.suit.health = 100;
      this.suit.energy = 50;
      this.playerPos.set(0, 0.2, 5.0);
      this.playerVel.set(0, 0, 0);
      this.astronaut.root.position.copy(this.playerPos);
      this.callbacks.onSuitUpdate(this.suit);
      this.callbacks.onInteractPrompt('CRITICAL CASUALTY: EMERGENCY SHIP TELEPORT ENGAGED');
      soundEngine.playHazardWarning();
    }
  }

  // Villain defeated callback
  private handleVillainDefeated(pos: THREE.Vector3) {
    soundEngine.stopChaseMusic();
    this.callbacks.onInteractPrompt('ALIEN OVERLORD DEFEATED! ANCIENT RELIC RECOVERED');
    soundEngine.playAlienDefeated();
    this.callbacks.onResourceCollected('Precursor Dark Matter Core', 1);
    this.callbacks.onTriggerEvent('evt_alien_encounter');
  }

  public toggleFlashlight() {
    this.suit.flashlight = !this.suit.flashlight;
    this.astronaut.flashlight.visible = this.suit.flashlight;
    soundEngine.playUiClick();
    this.callbacks.onSuitUpdate(this.suit);
  }

  // Main Simulation Loop
  private startLoop() {
    const loop = () => {
      if (this.isDisposed) return;
      this.animFrameId = requestAnimationFrame(loop);

      const delta = Math.min(this.clock.getDelta(), 0.1);

      if (this.gameState === 'intro') {
        if (this.destroyedHomeworld) {
          this.destroyedHomeworld.update(delta);
        }
      } else if (this.gameState === 'space_nav') {
        if (this.solarSystem) {
          this.solarSystem.updateOrbits(delta);
        }
      } else if (this.gameState === 'cinematic_flight') {
        this.updateFlightCinematic(delta);
      } else if (this.gameState === 'planet_surface') {
        this.updateSurfaceGameplay(delta);
      }

      this.renderer.render(this.scene, this.camera);
    };

    loop();
  }

  // Surface Exploration Movement & Environmental Simulation
  private updateSurfaceGameplay(delta: number) {
    if (!this.terrainResult) return;

    const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const moveSpeed = isRunning ? 9.5 : 5.2;

    // Forward direction the camera is facing horizontally in XZ
    const camForward = new THREE.Vector3(
      Math.sin(this.cameraYaw),
      0,
      Math.cos(this.cameraYaw)
    ).normalize();

    // Right direction relative to camera
    const camRight = new THREE.Vector3(
      Math.cos(this.cameraYaw),
      0,
      -Math.sin(this.cameraYaw)
    ).normalize();

    let forwardInput = 0;
    let strafeInput = 0;

    // W = Move forward away from camera, S = Move backward towards camera
    if (this.keys['KeyW'] || this.keys['ArrowUp']) forwardInput += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forwardInput -= 1;
    // A = Strafe left, D = Strafe right
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) strafeInput -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) strafeInput += 1;

    // Mobile Virtual Joystick input
    if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
      strafeInput = this.joystickVector.x;
      forwardInput = -this.joystickVector.y;
    }

    const isMoving = Math.abs(forwardInput) > 0.05 || Math.abs(strafeInput) > 0.05;

    // Horizontal Movement
    if (isMoving) {
      const moveDir = new THREE.Vector3();
      moveDir.addScaledVector(camForward, forwardInput);
      moveDir.addScaledVector(camRight, strafeInput);

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();

        const targetRotation = Math.atan2(moveDir.x, moveDir.z);
        let diff = targetRotation - this.playerRotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.playerRotation += diff * Math.min(1.0, delta * 18);
        this.astronaut.root.rotation.y = this.playerRotation;

        this.playerPos.addScaledVector(moveDir, moveSpeed * delta);
      }

      // Footstep sound timing
      this.footstepTimer += delta * (isRunning ? 1.6 : 1.0);
      if (this.footstepTimer > 0.38) {
        soundEngine.playFootstep(isRunning);
        this.footstepTimer = 0;
      }
    }

    // Jump & Jetpack (Space or mobile jump button)
    this.jumpCooldown -= delta;
    const wantsJump = this.keys['Space'] || this.mobileActions.jump;
    const gravity = 9.8 * this.currentPlanet.gravity;

    if (wantsJump && this.jumpCooldown <= 0) {
      if (this.isGrounded) {
        this.playerVel.y = 7.0;
        this.isGrounded = false;
        this.jumpCooldown = 0.4;
        soundEngine.playJetpack();
      } else if (this.suit.energy > 5) {
        // Double-jump jetpack thrust!
        this.playerVel.y = Math.min(this.playerVel.y + 12 * delta, 8.5);
        this.suit.energy = Math.max(0, this.suit.energy - delta * 15);
        this.callbacks.onSuitUpdate(this.suit);
        soundEngine.playJetpack();
      }
    }

    // Apply gravity
    this.playerVel.y -= gravity * delta;
    this.playerPos.y += this.playerVel.y * delta;

    // Terrain Ground Collision Check
    const terrainHeight = this.terrainResult.getTerrainHeight(
      this.playerPos.x,
      this.playerPos.z
    );

    if (this.playerPos.y <= terrainHeight) {
      this.playerPos.y = terrainHeight;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }

    // Update Astronaut Model Position
    this.astronaut.root.position.copy(this.playerPos);

    // Update Alien Villain AI and Combat
    let isEncounteringVillain = false;
    let distToVillain = 999;
    if (this.villain && !this.villain.isDead) {
      distToVillain = this.playerPos.distanceTo(this.villain.mesh.position);
      // Villain encounter is active when within detection/chase distance (36m) or alert
      isEncounteringVillain = distToVillain < 36.0 || this.villain.hasSpottedPlayer;

      this.villain.updateAI(
        delta,
        this.playerPos,
        this.terrainResult!.getTerrainHeight,
        (damage) => this.handlePlayerDamage(damage)
      );

      // Dynamic suspense & chase music (modulates pulse tempo and intensity based on distance)
      soundEngine.updateChaseMusic(
        distToVillain,
        this.villain.state === 'chase' || this.villain.state === 'attack'
      );
    } else {
      soundEngine.stopChaseMusic();
    }

    // Update Astronaut Animations (Default untitled walk vs Run Look Back during alien encounter)
    this.astronaut.updateAnimation(
      delta,
      isMoving,
      isRunning,
      !this.isGrounded,
      this.suit.isScanning,
      isEncounteringVillain
    );

    // Update Spaceship Idle animations & beacon
    this.spaceship.update(delta);

    // Update Alien Creatures AI
    this.creatures.forEach((c) => {
      c.updateAI(delta, this.playerPos, this.terrainResult!.getTerrainHeight);
    });

    // Update Weapon cooldown & projectiles
    this.weaponCooldown = Math.max(0, this.weaponCooldown - delta);
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.position.addScaledVector(p.velocity, delta);
      p.mesh.position.copy(p.position);
      p.light.position.copy(p.position);
      p.life -= delta;

      let hit = false;

      // 1. Check Villain hit
      if (this.villain && !this.villain.isDead) {
        const vCenter = this.villain.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        if (p.position.distanceTo(vCenter) < 2.0) {
          hit = true;
          this.villain.takeDamage(p.damage);
        }
      }

      // 2. Check Ground / Terrain collision
      const groundH = this.terrainResult.getTerrainHeight(p.position.x, p.position.z);
      if (p.position.y <= groundH) {
        hit = true;
      }

      if (hit || p.life <= 0) {
        this.scene.remove(p.mesh);
        this.scene.remove(p.light);
        p.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      }
    }

    // Update Environmental Suit Life Support & Hazards
    this.updateSuitSimulation(delta);

    // Camera Collision & Follow
    this.updateCameraOrbit(delta);

    // Update Interaction Prompt for HUD
    this.checkInteractionPrompts();
  }

  // Environmental Hazards & Suit Life Support
  private updateSuitSimulation(delta: number) {
    const distToShip = this.playerPos.distanceTo(new THREE.Vector3(0, 0, 0));

    if (distToShip < 8.0) {
      // Near ship: Safe Zone! Rapidly replenish life support, heal hearts & recharge
      this.suit.energy = Math.min(100, this.suit.energy + delta * 12);
      this.suit.lifeSupport = Math.min(100, this.suit.lifeSupport + delta * 15);
      this.suit.integrity = Math.min(100, this.suit.integrity + delta * 5);
      this.suit.health = Math.min(100, this.suit.health + delta * 15);
      this.suit.hazardWarning = null;
    } else {
      // Out on surface: natural slow energy consumption
      let energyDrain = 0.25;
      let lifeSupportDrain = 0.2;
      let integrityDamage = 0;
      let warning: string | null = null;

      if (this.currentPlanet.hazards.includes('freezing')) {
        energyDrain += 1.2; // cold drains thermal heaters
        warning = 'FREEZING TEMPERATURE: -85°C [THERMAL HEATING ACTIVE]';
      }
      if (this.currentPlanet.hazards.includes('toxic')) {
        lifeSupportDrain += 1.5; // acid/toxic vapors stress filters
        warning = 'TOXIC ATMOSPHERE: CHEMICAL SCRUBBERS AT 100%';
      }
      if (this.currentPlanet.hazards.includes('heat')) {
        energyDrain += 1.5;
        integrityDamage += 0.4;
        warning = 'EXTREME GEOTHERMAL HEAT: SHIELD STRESS';
      }
      if (this.currentPlanet.hazards.includes('radiation')) {
        integrityDamage += 0.3;
        warning = 'IONIZING RADIATION DETECTED';
      }

      this.suit.energy = Math.max(0, this.suit.energy - energyDrain * delta);
      this.suit.lifeSupport = Math.max(0, this.suit.lifeSupport - lifeSupportDrain * delta);
      this.suit.integrity = Math.max(0, this.suit.integrity - integrityDamage * delta);
      this.suit.hazardWarning = warning;

      // If life support drops to 0, suit integrity starts failing
      if (this.suit.lifeSupport <= 0) {
        this.suit.integrity = Math.max(0, this.suit.integrity - delta * 4);
      }
    }

    this.callbacks.onSuitUpdate(this.suit);
  }

  // Camera Orbit, Smooth Following & Anti-Ground Clipping
  private updateCameraOrbit(delta: number) {
    if (!this.terrainResult) return;

    // Focus on astronaut upper torso / head
    const targetLookAt = this.playerPos.clone().add(new THREE.Vector3(0, 1.35, 0));

    // Spherical coordinates: camera sits BEHIND the player relative to cameraYaw
    const cx =
      targetLookAt.x -
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const cy = targetLookAt.y + Math.sin(this.cameraPitch) * this.cameraDistance;
    const cz =
      targetLookAt.z -
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    const desiredCamPos = new THREE.Vector3(cx, cy, cz);

    // Anti-Ground Clipping: Ensure camera does not dip below terrain height
    const groundHeightAtCam = this.terrainResult.getTerrainHeight(
      desiredCamPos.x,
      desiredCamPos.z
    );
    if (desiredCamPos.y < groundHeightAtCam + 0.6) {
      desiredCamPos.y = groundHeightAtCam + 0.6;
    }

    // Smooth lerp
    this.camera.position.lerp(desiredCamPos, delta * 14);
    this.camera.lookAt(targetLookAt);
  }

  // Check Nearby Targets for [E] Interact Prompt
  private checkInteractionPrompts() {
    const distToShip = this.playerPos.distanceTo(new THREE.Vector3(0, 0, 3.8));
    if (distToShip < 4.2) {
      this.callbacks.onInteractPrompt('[E] ENTER SPACESHIP');
      return;
    }

    if (this.terrainResult) {
      for (const item of this.terrainResult.interactables) {
        const dist = this.playerPos.distanceTo(
          new THREE.Vector3(item.position[0], item.position[1], item.position[2])
        );
        if (dist < 4.2 && !item.interacted) {
          if (item.type === 'weapon' && item.weaponReward) {
            this.callbacks.onInteractPrompt(
              `[E] EQUIP ${item.name.toUpperCase()} [DMG: ${item.weaponReward.damage}]`
            );
            return;
          }
          this.callbacks.onInteractPrompt(`[E] HARVEST ${item.name.toUpperCase()}`);
          return;
        }
      }
    }

    this.callbacks.onInteractPrompt(null);
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);
    soundEngine.stopAmbient();
    this.renderer.dispose();
  }
}
