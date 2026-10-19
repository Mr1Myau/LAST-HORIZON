import { StoryEvent } from '../types/game';

export const STORY_EVENTS: StoryEvent[] = [
  {
    id: 'evt_homeworld_echo',
    title: 'ECHO OF AETHELGARD',
    triggerType: 'ruins',
    description: 'Embedded in the mineral stratum, your scanner identifies the twisted fuselage plate of an Aethelgardian battle-cruiser. A flickering flight black box is still transmitting in the ancient military cipher of your people.',
    choices: [
      {
        text: 'Decode the black box records to learn why the war escalated',
        outcomeText: 'You bypass the biometric lock. The decrypted audio reveals the final moments: the planet wasn’t targeted by a foreign weapon, but an experimental zero-point energy drill that fractured the core from within. You recover a Homeworld Clue and 25 Energy.',
        effect: {
          homeworldClueFound: true,
          suitEnergy: 25,
          resources: { 'precursor_drive': 1 }
        }
      },
      {
        text: 'Scavenge the remaining reactor shielding for your suit and ship',
        outcomeText: 'You carefully extract the high-density plating. The metal seamlessly patches into your suit and ship reinforcement protocols.',
        effect: {
          suitDamage: -30, // repairs suit
          shipFuel: 20
        }
      }
    ]
  },
  {
    id: 'evt_water_dilemma',
    title: 'THE PARCHED ENCLAVE',
    planetId: 'velora',
    triggerType: 'proximity',
    description: 'You discover a rudimentary outpost inhabited by primitive bipedal reptilians. Their settlement wells have run dry, and they stare in awe at your suit’s condenser exhaust venting clean moisture.',
    choices: [
      {
        text: 'Deploy your suit’s micro-desalination unit to purify their reservoir',
        outcomeText: 'The grateful beings sing in reverence and offer you radiant turquoise geode stones. Your suit energy decreases by 20%, but your codex logs a successful peaceful contact.',
        effect: {
          suitEnergy: -20,
          resources: { 'energy_crystal': 3, 'titanium': 2 },
          reputationTag: 'Benefactor'
        }
      },
      {
        text: 'Refuse to share tech to conserve life support reserves',
        outcomeText: 'You back away cautiously. The creatures retreat into the canyon. Your resources remain untouched, but the desolate silence of their plight lingers.',
        effect: {
          reputationTag: 'Pragmatist'
        }
      },
      {
        text: 'Trade water purification instructions for their local map data',
        outcomeText: 'You imprint simple hydraulic diagrams into their stone tablets. In exchange, their elder points you toward a rich deposit of rare lithium ore.',
        effect: {
          suitEnergy: -10,
          resources: { 'rare_isotope': 2 }
        }
      }
    ]
  },
  {
    id: 'evt_cryo_drifter',
    title: 'THE FROZEN SARCOPHAGUS',
    planetId: 'neryx',
    triggerType: 'proximity',
    description: 'Partially buried in a blue glacier lies a pre-collapse interstellar stasis pod. Thermal signatures indicate a biological occupant in suspended animation, but pod power will fail within hours.',
    choices: [
      {
        text: 'Reroute ship auxiliary power to revive the occupant',
        outcomeText: 'The cryo-valves hiss open. An alien astrophysicist from a lost colony gasps for air. Before resting, she uploads stellar sector coordinates to your ship navigation!',
        effect: {
          shipFuel: -15,
          homeworldClueFound: true,
          resources: { 'rare_isotope': 1 }
        }
      },
      {
        text: 'Download the occupant’s research archives without reviving',
        outcomeText: 'You extract the star catalogs while preserving the occupant’s dormant state. You gain valuable scientific data with zero power expenditure.',
        effect: {
          resources: { 'precursor_drive': 1 }
        }
      }
    ]
  },
  {
    id: 'evt_acid_surge',
    title: 'CORROSIVE FLASH TIDE',
    planetId: 'vanta',
    triggerType: 'random',
    description: 'A sudden seismic rupture opens beneath you, spewing a pressurized geyser of caustic sulfuric acid directly toward your exploration route!',
    choices: [
      {
        text: 'Overload suit electromagnetic shields to deflect the spray',
        outcomeText: 'A shimmering blue bubble deflects the acid droplets, but the intense power spike drains 35% of your suit energy.',
        effect: {
          suitEnergy: -35
        }
      },
      {
        text: 'Perform an emergency sprint toward high basalt rocks',
        outcomeText: 'You scramble to safety, but acidic mist damages the seal around your leg servos. Suit integrity drops by 20%.',
        effect: {
          suitDamage: 20
        }
      }
    ]
  },
  {
    id: 'evt_ancient_monolith',
    title: 'THE HARMONIC MONOLITH',
    triggerType: 'ruins',
    description: 'A monolithic spire of polished obsidian rises 50 meters into the sky. It vibrates with mathematical frequencies that resonate directly through your helmet’s audio receptors.',
    choices: [
      {
        text: 'Tune your suit scanner frequency to harmonize with the spire',
        outcomeText: 'The spire illuminates with golden runes. It beams a deep-space transmission into your nav-computer, revealing planetary coordinates and recharging your life support!',
        effect: {
          suitEnergy: 30,
          homeworldClueFound: true
        }
      },
      {
        text: 'Extract the vibrating dark resonance core from the base',
        outcomeText: 'You use your plasma cutter to pry loose a glowing hyper-dense power node. The spire collapses, but you obtain a priceless energy matrix.',
        effect: {
          resources: { 'singularity_core': 1, 'energy_crystal': 2 }
        }
      }
    ]
  },
  {
    id: 'evt_biolum_bloom',
    title: 'BIOLUMINESCENT SPORE BURST',
    planetId: 'sylva',
    triggerType: 'random',
    description: 'You brush against a cluster of giant canopy fungi. Millions of iridescent emerald spores burst into the atmosphere, rapidly coating your helmet visor and intake filters.',
    choices: [
      {
        text: 'Activate suit chemical scrubbers at maximum intensity',
        outcomeText: 'The suit vents hiss with ozone. The spores are neutralized, and your suit synthesizes medicinal compounds from the biomass.',
        effect: {
          suitEnergy: -15,
          resources: { 'bio_chitin': 2 }
        }
      },
      {
        text: 'Collect live samples in your vacuum containment flask',
        outcomeText: 'You capture pristine bio-luminescent organisms for study. A slight filter clog drains 10% life support, but the specimen is invaluable.',
        effect: {
          resources: { 'bio_chitin': 3 }
        }
      }
    ]
  },
  {
    id: 'evt_derelict_probe',
    title: 'AUTOMATED EXPLORATION PROBE',
    triggerType: 'proximity',
    description: 'You locate a crashed reconnaissance probe half-submerged in regolith. Its solar panels are shattered, but its ion propulsion fuel cell is intact.',
    choices: [
      {
        text: 'Siphon the ion fuel directly into your ship reserves',
        outcomeText: 'Fuel transfer completed! Your ship warp drive gained +30% fuel.',
        effect: {
          shipFuel: 30
        }
      },
      {
        text: 'Dismantle the sensor array to upgrade your suit scanner',
        outcomeText: 'You integrate the high-frequency optical sensors. Your suit energy efficiency increases.',
        effect: {
          suitEnergy: 20,
          resources: { 'titanium': 2 }
        }
      }
    ]
  },
  {
    id: 'evt_predator_stalk',
    title: 'SHADOW IN THE CRATER',
    triggerType: 'creature',
    description: 'Low guttural growls echo from the rocks behind you. A multi-legged apex predator with thermographic vision is stalking your heat signature.',
    choices: [
      {
        text: 'Fire a high-intensity concussive flare to scare it away',
        outcomeText: 'The blinding flash and sonic crack send the predator fleeing in terror. You collect dropped chitinous scales.',
        effect: {
          suitEnergy: -10,
          resources: { 'bio_chitin': 1 }
        }
      },
      {
        text: 'Stand completely still and activate thermal camouflage',
        outcomeText: 'Your suit drops outer surface temp to ambient level. The predator sniffs the air in confusion and strides away into the ridges.',
        effect: {
          suitEnergy: -15
        }
      }
    ]
  },
  {
    id: 'evt_geothermal_vent',
    title: 'SUPERHEATED GEYSER FIELD',
    planetId: 'korvan',
    triggerType: 'proximity',
    description: 'A pressurized fissure in the volcanic crust is venting superheated mineral steam rich in energized plasma particles.',
    choices: [
      {
        text: 'Position suit thermal collector panels directly over the vent',
        outcomeText: 'Intense heat surges into the suit thermoelectric grid! Energy completely restored to 100%, though heat stresses outer seals slightly.',
        effect: {
          suitEnergy: 50,
          suitDamage: 10
        }
      },
      {
        text: 'Mine the cooled basalt crystal crust at the vent perimeter',
        outcomeText: 'You harvest pure volcanic obsidian and thermal crystals without risking suit damage.',
        effect: {
          resources: { 'obsidian': 3 }
        }
      }
    ]
  },
  {
    id: 'evt_synthetic_hermit',
    title: 'THE FORSAKEN SYNTHETIC',
    planetId: 'orion-9',
    triggerType: 'ruins',
    description: 'Inside a collapsed titanium bunker sits a lone android artisan, painstakingly carving holographic sculptures of a dead city.',
    choices: [
      {
        text: 'Ask the android if it knows about the weapon that ruined your home',
        outcomeText: 'The android’s eye optics pulse: "The Great Catalyst... it wasn’t war. It was an extraction attempt gone wrong. The core of your world was mined for an ark." You gain deep historical truth.',
        effect: {
          homeworldClueFound: true
        }
      },
      {
        text: 'Offer to recharge its depleted battery cells in exchange for tech',
        outcomeText: 'The android bows in gratitude and gifts you an ancient Precursor hyper-dense micro-capacitor.',
        effect: {
          suitEnergy: -20,
          resources: { 'precursor_drive': 1, 'energy_crystal': 2 }
        }
      }
    ]
  },
  {
    id: 'evt_oceanic_pulse',
    title: 'THE DEEP SIREN',
    planetId: 'aurel',
    triggerType: 'proximity',
    description: 'Standing near the shore, a colossal wave breaks as an enormous shadow passes beneath the crystalline waves. A soothing resonant pulse fills your thoughts.',
    choices: [
      {
        text: 'Transmit a peaceful harmonic greeting via your comms suite',
        outcomeText: 'The deep leviathan surfaces briefly, exhaling a spray of bioluminescent mist that cures all suit weariness. You feel a rare sense of peace in the lonely cosmos.',
        effect: {
          suitDamage: -25,
          suitEnergy: 25
        }
      },
      {
        text: 'Deploy a hydro-probe to sample the bioluminescent wake',
        outcomeText: 'The probe gathers pure bioluminescent compounds that can fuel biological life support.',
        effect: {
          resources: { 'biolum_gel': 3 }
        }
      }
    ]
  },
  {
    id: 'evt_magnetic_storm',
    title: 'IONIC AURORA TEMPEST',
    triggerType: 'random',
    description: 'The sky erupts in violent emerald and violet auroras as a coronal mass ejection strikes the upper ionosphere. Sparks dance along your gauntlets.',
    choices: [
      {
        text: 'Ground your suit antenna into a deep rock fissure',
        outcomeText: 'Lightning arcs into the bedrock. You channel 30% of the electromagnetic surge safely into your storage capacitors!',
        effect: {
          suitEnergy: 30
        }
      },
      {
        text: 'Run for shelter beneath an overhang',
        outcomeText: 'You take cover just as an EMP ripple blows across the plains. Your suit systems reboot cleanly without damage.',
        effect: {}
      }
    ]
  },
  {
    id: 'evt_subspace_beacon',
    title: 'GHOST OF CONVOY SEVEN',
    triggerType: 'proximity',
    description: 'Your suit detects an automated emergency buoy repeating a message: "Convoy 7 evacuated 12,000 citizens towards Sector 4. Fuel depleted. Establishing outpost..."',
    choices: [
      {
        text: 'Extract the nav-coordinates of Convoy 7’s refuge route',
        outcomeText: 'You update your star charts. Other survivors of your civilization may still be alive out there! Homeworld Clue logged.',
        effect: {
          homeworldClueFound: true
        }
      },
      {
        text: 'Dismantle the beacon for rare communication alloys',
        outcomeText: 'You salvage rare radioisotopes and high-frequency wave-guides.',
        effect: {
          resources: { 'rare_isotope': 2, 'titanium': 2 }
        }
      }
    ]
  },
  {
    id: 'evt_gravity_anomaly',
    title: 'SINGULARITY FRACTURE',
    planetId: 'unknown-01',
    triggerType: 'proximity',
    description: 'A miniature floating micro-black hole bends light and rocks in an uncanny slow-motion orbit. The space-time continuum feels fragile here.',
    choices: [
      {
        text: 'Carefully launch a gravity anchor to harvest Hawking radiation',
        outcomeText: 'The anchor absorbs pure dark energy! Your ship gains indefinite hyper-fuel capabilities.',
        effect: {
          shipFuel: 50,
          resources: { 'singularity_core': 2 }
        }
      },
      {
        text: 'Step closer to glimpse through the gravitational lens',
        outcomeText: 'For a fleeting instant, you see visions of your homeworld before the fire... and a green sanctuary planet awaiting you across the stars. Homeworld Clue discovered!',
        effect: {
          homeworldClueFound: true,
          suitEnergy: -15
        }
      }
    ]
  },
  {
    id: 'evt_alien_sanctuary',
    title: 'PROMISE OF THE LAST HORIZON',
    triggerType: 'ruins',
    description: 'You uncover an ancient planetary sanctuary archive. It records that across the galaxy, worlds shattered by war can be seeded anew if a traveler brings the three sacred cores: Energy, Memory, and Life.',
    choices: [
      {
        text: 'Commit your voyage to finding and uniting these three cores',
        outcomeText: 'A renewed sense of destiny fills your heart. You are not just a refugee; you are the seed of a new civilization. All suit systems operate at peak efficiency.',
        effect: {
          suitEnergy: 50,
          suitDamage: -50,
          homeworldClueFound: true
        }
      }
    ]
  }
];
