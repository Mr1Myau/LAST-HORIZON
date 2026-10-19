import * as THREE from 'three';

export interface SpaceshipRig {
  root: THREE.Group;
  thrusterPlumes: THREE.Mesh[];
  thrusterLights: THREE.PointLight[];
  cabinLight: THREE.PointLight;
  boardingBeacon: THREE.Mesh;
  setThrusterPower: (power: number) => void;
  update: (delta: number) => void;
}

export function createSpaceship(): SpaceshipRig {
  const root = new THREE.Group();
  root.name = 'Spaceship';

  // Materials
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // slate titanium
    metalness: 0.85,
    roughness: 0.3,
  });

  const darkPlateMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // dark graphite armor
    metalness: 0.9,
    roughness: 0.2,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4, // cyan glowing cockpit
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.85,
    metalness: 0.9,
    roughness: 0.1,
  });

  const engineGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.7,
  });

  const orangeDecalMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
  });

  // Main Fuselage / Body
  const bodyGeo = new THREE.ConeGeometry(2.4, 8.5, 6);
  bodyGeo.rotateX(Math.PI / 2);
  const fuselage = new THREE.Mesh(bodyGeo, hullMat);
  fuselage.scale.set(1.2, 0.7, 1);
  fuselage.position.y = 2.4;
  fuselage.castShadow = true;
  root.add(fuselage);

  // Cockpit Canopy
  const canopyGeo = new THREE.SphereGeometry(1.1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const canopy = new THREE.Mesh(canopyGeo, glassMat);
  canopy.scale.set(0.9, 0.6, 2.0);
  canopy.position.set(0, 2.9, 1.2);
  canopy.rotation.x = -0.15;
  root.add(canopy);

  // Cabin interior glow
  const cabinLight = new THREE.PointLight(0x06b6d4, 1.5, 6);
  cabinLight.position.set(0, 3.0, 1.2);
  root.add(cabinLight);

  // Wings (Swept-back forward delta wings)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(4.5, -2.5);
  wingShape.lineTo(4.2, -4.0);
  wingShape.lineTo(1.2, -3.2);
  wingShape.lineTo(0, -3.0);
  wingShape.closePath();

  const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
  wingGeo.rotateX(Math.PI / 2);

  // Right wing
  const rightWing = new THREE.Mesh(wingGeo, darkPlateMat);
  rightWing.position.set(0.6, 2.2, 1.5);
  rightWing.castShadow = true;
  root.add(rightWing);

  // Left wing
  const leftWing = rightWing.clone();
  leftWing.scale.x = -1;
  leftWing.position.set(-0.6, 2.2, 1.5);
  root.add(leftWing);

  // Wingtip Plasma Fins / Beacons
  const finGeo = new THREE.BoxGeometry(0.12, 0.8, 1.2);
  const rightFin = new THREE.Mesh(finGeo, orangeDecalMat);
  rightFin.position.set(4.3, 2.5, -1.8);
  root.add(rightFin);

  const leftFin = rightFin.clone();
  leftFin.position.set(-4.3, 2.5, -1.8);
  root.add(leftFin);

  // Twin Heavy Ion Thruster Pods (Left & Right)
  const engineHousingGeo = new THREE.CylinderGeometry(0.6, 0.75, 3.2, 12);
  engineHousingGeo.rotateX(Math.PI / 2);

  const leftEngine = new THREE.Mesh(engineHousingGeo, darkPlateMat);
  leftEngine.position.set(-1.6, 2.2, -2.4);
  leftEngine.castShadow = true;
  root.add(leftEngine);

  const rightEngine = leftEngine.clone();
  rightEngine.position.set(1.6, 2.2, -2.4);
  root.add(rightEngine);

  // Center Main Sub-light Booster
  const centerEngineGeo = new THREE.CylinderGeometry(0.7, 0.9, 2.8, 12);
  centerEngineGeo.rotateX(Math.PI / 2);
  const centerEngine = new THREE.Mesh(centerEngineGeo, darkPlateMat);
  centerEngine.position.set(0, 2.2, -3.2);
  centerEngine.castShadow = true;
  root.add(centerEngine);

  // Thruster flame plumes
  const thrusterPlumes: THREE.Mesh[] = [];
  const thrusterLights: THREE.PointLight[] = [];

  const plumePositions = [
    [-1.6, 2.2, -4.2],
    [1.6, 2.2, -4.2],
    [0, 2.2, -4.8],
  ];

  plumePositions.forEach((pos) => {
    const plumeGeo = new THREE.ConeGeometry(0.55, 3.5, 12);
    plumeGeo.rotateX(-Math.PI / 2);
    const plume = new THREE.Mesh(plumeGeo, engineGlowMat);
    plume.position.set(pos[0], pos[1], pos[2]);
    root.add(plume);
    thrusterPlumes.push(plume);

    const light = new THREE.PointLight(0x38bdf8, 2, 10);
    light.position.set(pos[0], pos[1], pos[2]);
    root.add(light);
    thrusterLights.push(light);
  });

  // Landing Struts / Gear (Tri-pod configuration)
  const strutMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.4 });
  const strutGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.4, 6);
  const padGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8);

  function createLandingLeg(x: number, z: number, angleZ: number, angleX: number) {
    const legGroup = new THREE.Group();
    legGroup.position.set(x, 1.2, z);

    const strut = new THREE.Mesh(strutGeo, strutMat);
    strut.rotation.z = angleZ;
    strut.rotation.x = angleX;
    legGroup.add(strut);

    const pad = new THREE.Mesh(padGeo, darkPlateMat);
    pad.position.set(x > 0 ? 0.35 : x < 0 ? -0.35 : 0, -1.15, z > 0 ? 0.35 : -0.35);
    legGroup.add(pad);

    return legGroup;
  }

  root.add(createLandingLeg(0, 2.5, 0, 0.2));
  root.add(createLandingLeg(-1.8, -1.8, -0.2, -0.1));
  root.add(createLandingLeg(1.8, -1.8, 0.2, -0.1));

  // Boarding Ramp / Entry Zone Beacon (Glowing hologram circle on the ground)
  const beaconGeo = new THREE.RingGeometry(0.9, 1.25, 24);
  beaconGeo.rotateX(-Math.PI / 2);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const boardingBeacon = new THREE.Mesh(beaconGeo, beaconMat);
  boardingBeacon.position.set(0, 0.05, 3.8);
  root.add(boardingBeacon);

  // Small holographic projection pillars
  const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
  const pillarMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const p1 = new THREE.Mesh(pillarGeo, pillarMat);
  p1.position.set(-1.1, 0.3, 3.8);
  const p2 = new THREE.Mesh(pillarGeo, pillarMat);
  p2.position.set(1.1, 0.3, 3.8);
  root.add(p1);
  root.add(p2);

  let pulseTimer = 0;

  const setThrusterPower = (power: number) => {
    // power: 0 to 1
    thrusterPlumes.forEach((plume, i) => {
      plume.scale.set(1 + power * 0.5, 1 + power * 0.5, power * 2.5);
      (plume.material as THREE.MeshBasicMaterial).opacity = power > 0.01 ? 0.5 + power * 0.5 : 0.0;
      thrusterLights[i].intensity = power * 6;
    });
  };

  // Initially on standby / parked
  setThrusterPower(0);

  const update = (delta: number) => {
    pulseTimer += delta * 3;
    // Pulse boarding beacon
    beaconMat.opacity = 0.4 + Math.sin(pulseTimer) * 0.25;
  };

  return {
    root,
    thrusterPlumes,
    thrusterLights,
    cabinLight,
    boardingBeacon,
    setThrusterPower,
    update,
  };
}
