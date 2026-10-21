export type PlanetType =
  | 'Rocky'
  | 'Desert'
  | 'Ocean'
  | 'Ice'
  | 'Volcanic'
  | 'Forest'
  | 'Toxic'
  | 'Dead'
  | 'Artificial'
  | 'Unknown';

export type DangerLevel = 'Low' | 'Moderate' | 'High' | 'Extreme' | 'Unknown';
export type CivilizationLevel = 'None' | 'Primitive' | 'Remnants' | 'Advanced' | 'Unknown';

export interface PlanetDef {
  id: string;
  name: string;
  type: PlanetType;
  temperature: string;
  tempValue: number; // in Celsius for calculations
  atmosphere: string;
  gravity: number; // e.g. 0.91
  dangerLevel: DangerLevel;
  civilizationLevel: CivilizationLevel;
  description: string;
  lore: string;
  skyColor: string;
  fogColor: string;
  groundColor: string;
  rockColor: string;
  sunColor: string;
  lightIntensity: number;
  hazards: ('toxic' | 'freezing' | 'heat' | 'radiation' | 'storm')[];
  primaryResources: string[];
  nativeFlora: string[];
  nativeFauna: string[];
  solarDistance: number; // AU or relative
  orbitSpeed: number;
  orbitRadius: number;
  size: number;
  colorHex: number;
  clouds?: boolean;
  rings?: boolean;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'energy' | 'oxygen' | 'mineral' | 'rare' | 'biological' | 'relic';
  quantity: number;
  icon: string;
  description: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  type: 'blaster' | 'scatter' | 'rifle';
  damage: number;
  fireRate: number; // minimum delay in seconds
  color: number;
  ammo?: number;
  heat: number; // 0 - 100
  description: string;
}

export interface SuitStatus {
  health: number; // 0 - 100 (5 hearts = 100 hp, 20 hp each)
  maxHealth: number;
  energy: number; // 0 - 100
  integrity: number; // 0 - 100
  lifeSupport: number; // 0 - 100 (Oxygen/Environment filter)
  isScanning: boolean;
  hazardWarning: string | null;
  flashlight: boolean;
  weapon: WeaponDef | null;
}

export interface ShipStatus {
  integrity: number; // 0 - 100
  fuel: number; // 0 - 100
  warpDriveReady: boolean;
  cargoCapacity: number;
}

export interface InteractableObject {
  id: string;
  name: string;
  type: 'ship' | 'resource' | 'creature' | 'ruins' | 'plant' | 'signal' | 'artifact' | 'weapon';
  position: [number, number, number];
  distance?: number;
  interacted?: boolean;
  scanned?: boolean;
  resourceReward?: {
    id: string;
    name: string;
    amount: number;
    category: ResourceItem['category'];
  };
  weaponReward?: WeaponDef;
  details: {
    classification: string;
    threat: string;
    composition: string;
    origin: string;
    notes: string;
  };
}

export interface CreatureEntity {
  id: string;
  name: string;
  type: 'peaceful' | 'predator' | 'flying' | 'anomaly' | 'villain';
  position: [number, number, number];
  rotation: number;
  speed: number;
  danger: 'Low' | 'Medium' | 'High' | 'Lethal' | 'Unknown';
  behavior: 'wander' | 'flee' | 'stalk' | 'glide' | 'attack';
  state: 'idle' | 'moving' | 'alert' | 'attacking' | 'dead';
  scanned: boolean;
  description: string;
  health: number;
  maxHealth?: number;
}

export interface CodexEntry {
  id: string;
  category: 'planets' | 'species' | 'civilizations' | 'flora' | 'resources' | 'signals' | 'story';
  title: string;
  subtitle: string;
  discovered: boolean;
  discoveryDate?: string;
  details: string[];
  lore: string;
  stats?: Record<string, string>;
}

export interface StoryChoice {
  text: string;
  outcomeText: string;
  effect: {
    resources?: Partial<Record<string, number>>;
    suitDamage?: number;
    suitEnergy?: number;
    shipFuel?: number;
    homeworldClueFound?: boolean;
    reputationTag?: string;
  };
}

export interface StoryEvent {
  id: string;
  title: string;
  planetId?: string; // specific to planet or general
  triggerType: 'proximity' | 'scan' | 'ruins' | 'creature' | 'random';
  description: string;
  imageUrl?: string;
  choices: StoryChoice[];
}

export type GameState =
  | 'intro'
  | 'space_nav'
  | 'cinematic_flight'
  | 'planet_surface'
  | 'game_over'
  | 'won_new_home';

export interface GameSaveData {
  currentPlanetId: string;
  visitedPlanetIds: string[];
  suit: SuitStatus;
  ship: ShipStatus;
  inventory: Record<string, ResourceItem>;
  codex: Record<string, CodexEntry>;
  completedEventIds: string[];
  homeworldCluesFound: number;
  playerLocation: [number, number, number];
  timestamp: number;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface Mission {
  id: string;
  category: MissionDifficulty;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    title: string;
    description: string;
    type: 'health' | 'energy' | 'integrity' | 'weapon' | 'resource' | 'clue' | 'pet';
    amount: number;
    resourceName?: string;
  };
}
