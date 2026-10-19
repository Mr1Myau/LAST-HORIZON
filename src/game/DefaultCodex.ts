import { CodexEntry } from '../types/game';

export const INITIAL_CODEX: Record<string, CodexEntry> = {
  // Planets
  codex_planet_velora: {
    id: 'codex_planet_velora',
    category: 'planets',
    title: 'VELORA (Temperate Rocky)',
    subtitle: 'Primary Scout Target',
    discovered: true,
    lore: 'A rocky, temperate world scattered with ancient mineral spires and luminescent shrubs. Moderate atmospheric conditions make it a prime candidate for exploration.',
    details: [
      'Atmosphere: Breathable (O2/N2 21%)',
      'Gravity: 0.91G (Comfortable for human physiology)',
      'Temperature: +18°C Average',
      'Surface Geology: Stable tectonic plate activity with high crystal mineralization',
    ],
    stats: {
      'Habitability Index': '78%',
      Radiation: 'Low',
      'Hydrological Presence': 'Subterranean Aquifers',
    },
  },
  codex_planet_neryx: {
    id: 'codex_planet_neryx',
    category: 'planets',
    title: 'NERYX (Cryo Ice World)',
    subtitle: 'Sub-Zero Sector 2',
    discovered: false,
    lore: 'Glacial tundra world enveloped in eternal cryo-storms and blue ice spires. Freezing temperatures rapidly drain suit thermal batteries.',
    details: [
      'Atmosphere: Nitrogen-Methane trace, extreme cold',
      'Gravity: 0.84G',
      'Temperature: -85°C',
    ],
    stats: {
      'Habitability Index': '14%',
      Radiation: 'Low',
      'Hydrological Presence': 'Sub-surface Ice Oceans',
    },
  },
  codex_planet_aurel: {
    id: 'codex_planet_aurel',
    category: 'planets',
    title: 'AUREL (Oceanic Archipelago)',
    subtitle: 'Aquatic Sector 3',
    discovered: false,
    lore: 'An endless turquoise aquatic world with scattered archipelago atolls and bioluminescent reef formations.',
    details: [
      'Atmosphere: Dense Vapor / High Humidity',
      'Gravity: 1.05G',
      'Temperature: +24°C',
    ],
    stats: {
      'Habitability Index': '84%',
      Radiation: 'Low',
      'Hydrological Presence': 'Global Oceans (96%)',
    },
  },
  codex_planet_korvan: {
    id: 'codex_planet_korvan',
    category: 'planets',
    title: 'KORVAN (Volcanic Inferno)',
    subtitle: 'High Energy Sector',
    discovered: false,
    lore: 'A violently active volcanic inferno of basalt crusts, magma rivers, and black smoke columns.',
    details: [
      'Atmosphere: Dense Sulfur Dioxide / Carbon Ash',
      'Gravity: 1.32G',
      'Temperature: +410°C',
    ],
    stats: {
      'Habitability Index': '2%',
      Radiation: 'Moderate',
      'Geothermal Activity': 'Extreme',
    },
  },
  codex_planet_sylva: {
    id: 'codex_planet_sylva',
    category: 'planets',
    title: 'SYLVA (Dense Alien Canopy)',
    subtitle: 'Megabio Sector',
    discovered: false,
    lore: 'A colossal canopy jungle where alien trees reach hundreds of meters into violet cloud layers. Teeming with exotic biomass.',
    details: [
      'Atmosphere: Dense Oxygen (34%) / Spore-laden',
      'Gravity: 0.96G',
      'Temperature: +22°C',
    ],
    stats: {
      'Habitability Index': '69%',
      Radiation: 'Negligible',
      'Biomass Density': 'Extreme',
    },
  },
  codex_planet_vanta: {
    id: 'codex_planet_vanta',
    category: 'planets',
    title: 'VANTA (Caustic Acid Wastes)',
    subtitle: 'Toxic Hazard Zone',
    discovered: false,
    lore: 'A murky acid-soaked wasteland dominated by corrosive emerald fog, sulfur vents, and dissolving stone monoliths.',
    details: [
      'Atmosphere: Chlorine & Methane vapors',
      'Gravity: 1.12G',
      'Temperature: +62°C',
    ],
    stats: {
      'Habitability Index': '8%',
      Radiation: 'High',
      'Corrosiveness Index': 'Critical',
    },
  },
  codex_planet_orion9: {
    id: 'codex_planet_orion9',
    category: 'planets',
    title: 'ORION-9 (Precursor Ruins)',
    subtitle: 'Archaeological Sector',
    discovered: false,
    lore: 'A desolated tomb world littered with towering shattered megaliths, silent synthetic towers, and echoing radar signals.',
    details: [
      'Atmosphere: Inert Argon / Barren',
      'Gravity: 1.02G',
      'Temperature: -12°C',
    ],
    stats: {
      'Habitability Index': '31%',
      Civilization: 'Remnants / Extinct',
      'Technological Signature': 'High-Bandwidth Residual',
    },
  },
  codex_planet_unknown: {
    id: 'codex_planet_unknown',
    category: 'planets',
    title: 'UNKNOWN-01 (Spatial Anomaly)',
    subtitle: 'Class-X Singularity',
    discovered: false,
    lore: 'A defying anomaly in deep orbit. Floating fractal geometric monoliths and shimmering gravity wells defy conventional stellar physics.',
    details: [
      'Atmosphere: Quantum Distorted Flux',
      'Gravity: 0.72G (Variable)',
      'Temperature: Fluctuating',
    ],
    stats: {
      'Habitability Index': '???',
      'Spatial Coherence': 'Unstable',
      'Anomaly Type': 'Precursor Weapon Genesis Site',
    },
  },

  // Species
  codex_species_hopper: {
    id: 'codex_species_hopper',
    category: 'species',
    title: 'Crystalline Hopper',
    subtitle: 'Indigenous Herbivore',
    discovered: true,
    lore: 'A peaceful hexapod herbivore with an exoskeleton reinforced by silica crystals. Communicates with gentle harmonic chirps.',
    details: [
      'Threat Level: None',
      'Locomotion: Bipedal / Quadrupedal Springing',
      'Diet: Mineral lichen and crystalline spores',
    ],
    stats: {
      Behavior: 'Skittish / Non-Hostile',
      Metabolism: 'Silicate-Carbon Hybrid',
    },
  },
  codex_species_stalker: {
    id: 'codex_species_stalker',
    category: 'species',
    title: 'Ridge Stalker',
    subtitle: 'Apex Predator',
    discovered: false,
    lore: 'A muscular quadruped equipped with thermal vision and serrated obsidian claws. Highly territorial when approached.',
    details: [
      'Threat Level: High',
      'Sensory: Infrared thermal tracking',
      'Hunting Style: Ambush from ridges',
    ],
    stats: {
      Behavior: 'Territorial / Stalking',
      'Armor Rating': 'Reinforced Chitin',
    },
  },
  codex_species_ray: {
    id: 'codex_species_ray',
    category: 'species',
    title: 'Aether Ray',
    subtitle: 'Atmospheric Glider',
    discovered: false,
    lore: 'A gentle titan of the upper stratosphere that glides effortlessly across thermal atmospheric slipstreams.',
    details: [
      'Threat Level: Low',
      'Flight Mechanism: Low-frequency acoustic anti-gravity',
      'Habitat: Stratosphere (1000m - 8000m)',
    ],
    stats: {
      Wingspan: '8.4 Meters',
      Longevity: 'Estimated 300+ Years',
    },
  },
  codex_species_luminary: {
    id: 'codex_species_luminary',
    category: 'species',
    title: 'Void Luminary',
    subtitle: 'Quantum Sentience',
    discovered: false,
    lore: 'An enigmatic being composed of hovering geometric crystal facets that pulse with coherent violet laser light.',
    details: [
      'Threat Level: Unknown',
      'Nature: Non-organic crystalline consciousness',
      'Origin: Interdimensional anomaly',
    ],
    stats: {
      Sentience: 'Transcendent',
      'Physical Mass': 'Fluctuating',
    },
  },

  // Flora
  codex_flora_bush: {
    id: 'codex_flora_bush',
    category: 'flora',
    title: 'Luminescent Spore Flora',
    subtitle: 'Photosynthetic Organism',
    discovered: true,
    lore: 'Glowing alien shrubs that harvest radiation and starlight to generate nutrient-rich bioluminescent resins.',
    details: [
      'Yield: Bio-Chitin and Nutrient Paste',
      'Bioluminescence: Cyan / Emerald phosphor',
    ],
    stats: {
      'Toxicity Level': 'Zero',
      'Nutritional Value': 'High',
    },
  },

  // Resources
  codex_res_crystal: {
    id: 'codex_res_crystal',
    category: 'resources',
    title: 'Resonant Energy Crystal',
    subtitle: 'Ionic Power Source',
    discovered: true,
    lore: 'Naturally grown piezoelectric crystals that discharge continuous electrical potential when stimulated.',
    details: [
      'Primary Utility: Recharging Suit Battery & Auxiliary Vessel Cells',
      'Refinement: Can be directly injected without processing',
    ],
    stats: {
      'Energy Density': '4.2 kWh/kg',
      Purity: '98.7%',
    },
  },
  codex_res_titanium: {
    id: 'codex_res_titanium',
    category: 'resources',
    title: 'Titanium-Cobalt Composite',
    subtitle: 'Structural Alloy',
    discovered: true,
    lore: 'Dense mineral deposits containing high concentrations of aerospace-grade metallic elements.',
    details: [
      'Primary Utility: Fabricating Hull Patches & Exo-Suit Integrity Plating',
    ],
    stats: {
      'Tensile Strength': '1200 MPa',
      CorrosionResistance: 'Maximum',
    },
  },

  // Civilizations
  codex_civ_aethelgard: {
    id: 'codex_civ_aethelgard',
    category: 'civilizations',
    title: 'The Fallen Realm of Aethelgard',
    subtitle: 'The Protagonist’s Lost Civilization',
    discovered: true,
    lore: 'Once a golden civilization of architects, astronomers, and engineers spanning three core systems. Pride and unchecked exploitation of zero-point planetary extraction fractured the home world into dust.',
    details: [
      'Status: Extinct / Scatter-fleet survivors',
      'Technology Level: Type 2 Kardashev',
      'Final Weapon: Core Singularity Extractor',
    ],
    stats: {
      'Casualties Estimated': '14.8 Billion',
      'Known Survivors': 'You and unidentified scout craft',
    },
  },
  codex_civ_precursors: {
    id: 'codex_civ_precursors',
    category: 'civilizations',
    title: 'The Ancient Builders',
    subtitle: 'Pre-Historic Monolith Architects',
    discovered: false,
    lore: 'Ruins and monolithic steles scattered across Orion-9 and distant sectors point to an older race that left star maps before vanishing.',
    details: [
      'Status: Unknown',
      'Language: Resonant harmonic runes',
    ],
    stats: {
      Age: '> 500,000 Years',
    },
  },

  // Story & Clues
  codex_story_prologue: {
    id: 'codex_story_prologue',
    category: 'story',
    title: 'The Search for the Last Horizon',
    subtitle: 'Mission Objective',
    discovered: true,
    lore: 'With your home world obliterated in planetary fire, you launched in your scout vessel into uncharted space. Your telemetry scanners seek an habitable sanctuary world and other possible survivors of Convoy Seven.',
    details: [
      'Objective 1: Survey planets in the sector for life support compatibility.',
      'Objective 2: Gather 5 Homeworld Clues to pinpoint the sanctuary world coordinates.',
      'Objective 3: Maintain suit integrity and keep the vessel fueled.',
    ],
    stats: {
      'Mission Phase': 'Exploration & Survival',
    },
  },
};
