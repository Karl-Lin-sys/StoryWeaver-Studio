export interface PresetScene {
  id: string;
  name: string;
  genre: string;
  tone: string;
  imageUrl: string;
  description: string;
  cachedAnalysis?: {
    visualAnalysis: {
      mood: string;
      setting: string;
      atmosphere: string;
      colorPalette: string[];
      sensoryDetails: string[];
      keyFocalPoints: string[];
    };
    story: {
      title: string;
      genre: string;
      openingParagraph: string;
      narrativeHooks: string[];
      worldLoreSnippet: string;
    };
    suggestedVoice: {
      voiceName: string;
      styleInstruction: string;
    };
  };
}

export const PRESET_SCENES: PresetScene[] = [
  {
    id: 'cyberpunk-alley',
    name: 'Sector 4 Neon Shallows',
    genre: 'Cyberpunk Noir',
    tone: 'Rain-soaked, gritty, melancholic',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    description: 'A rain-slicked back-alley beneath flickering cobalt and crimson neon signs, steam rising from underground hydro-pipes.',
    cachedAnalysis: {
      visualAnalysis: {
        mood: 'Dystopian Neon Melancholy',
        setting: 'Lower Sub-Level 4, Neo-Kowloon Sprawl',
        atmosphere: 'Heavy acidic downpour, mist reflecting amber and cyan neon',
        colorPalette: ['#0f172a', '#06b6d4', '#ec4899', '#f59e0b'],
        sensoryDetails: [
          'Sizzle of rain droplets evaporating on overheated transformer vents',
          'Metallic tang of copper and ozone clinging to the stagnant air',
          'Rhythmic hum of subterranean mag-rail trains trembling through the asphalt',
          'Flicker of a dying holo-billboard reflecting off wet trenchcoat leather'
        ],
        keyFocalPoints: [
          'A lone operative waiting beneath an iron fire escape',
          'Flickering noodle cart lantern in the shadow of corporate towers',
          'Puddle catching refracted neon glare of a forbidden syndicate logo'
        ]
      },
      story: {
        title: 'The Frequency of Cold Rain',
        genre: 'Cyberpunk Noir',
        openingParagraph: 'The rain in Sub-Level 4 never quite washed away the smell of scorched synthetic solder. Ren stood motionless beneath the iron skeletal frame of the fire escape, counting the rhythmic pulses of the neon noodle-bar signage across the alleyway: three amber heartbeats, one stuttering violet death. In the pocket of his frayed duster, the memory drive hummed with illegal temperature, warm as a dying bird and twice as fragile. If the Syndicate scouts had tracked the signal this far down into the drainage canals, he had perhaps ninety seconds before the thermal drones carved through the fog.',
        narrativeHooks: [
          'Whose biometric memory was stored inside the overheated drive?',
          'Why did the noodle-cart vendor suddenly douse his lanterns?',
          'What lies beneath the flooded subway station at the alley\'s end?'
        ],
        worldLoreSnippet: 'Following the Great Power Severance of 2089, cities burrowed downward into tiered sub-levels where clean air was rationed by synthetic credit.'
      },
      suggestedVoice: {
        voiceName: 'Fenrir',
        styleInstruction: 'Low, gravelly noir detective cadence with deliberate pauses and weary suspense'
      }
    }
  },
  {
    id: 'floating-citadel',
    name: 'The Sunken Spire of Aethelgard',
    genre: 'High Fantasy / Mythic',
    tone: 'Ancient, awe-inspiring, mysterious',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    description: 'Ethereal stone towers suspended above emerald cloud valleys, shrouded in morning mist.',
    cachedAnalysis: {
      visualAnalysis: {
        mood: 'Ethereal Mythic Solitude',
        setting: 'The Celestial Spires of Aethelgard',
        atmosphere: 'Crisp mountain breeze carrying incense, golden dawn sunlight piercing silver cloud banks',
        colorPalette: ['#1e1b4b', '#d97706', '#10b981', '#f8fafc'],
        sensoryDetails: [
          'Soft ringing of windchimes forged from star-fallen iron',
          'Thin mountain chill tingling in the throat with every inhalation',
          'Vibration of levitation stones singing softly beneath the basalt paving',
          'Distant calls of feather-crested drakes soaring over cloud abysses'
        ],
        keyFocalPoints: [
          'A crumbling archway tethered by chains of pure enchanted silver',
          'A solitary scholar cloaked in azure velvet reading an unrolled star chart',
          'The blinding halo of dawn refracting through crystalline spires'
        ]
      },
      story: {
        title: 'Chains of the Cloud Sovereign',
        genre: 'High Fantasy / Mythic',
        openingParagraph: 'No mortal foot had touched the basalt stairs of Aethelgard since the sky-titans severed the mountain roots three centuries past. Yet here Kaela knelt, her fingers tracing the frost-rimmed runes carved into the uppermost archway. Below her dangling boots, a sea of mother-of-pearl clouds stretched to every horizon, punctured only by the jagged black teeth of the sister spires. The enchanted silver chain that anchored the floating monastery groaned against the wind—a heavy, metallic sigh that sounded suspiciously like a creature waking from an age-long sleep.',
        narrativeHooks: [
          'What ancient beast was chained beneath the floating citadel?',
          'Why did Kaela\'s star-map show an eighth spire that no one could see?',
          'What happens if the silver chain snaps before sundown?'
        ],
        worldLoreSnippet: 'The floating citadels were forged during the War of Shards, held aloft by primordial gravitite crystals mined from the world\'s core.'
      },
      suggestedVoice: {
        voiceName: 'Kore',
        styleInstruction: 'Lyrical, mystical, and solemn with warm cinematic resonance'
      }
    }
  },
  {
    id: 'clockwork-conservatory',
    name: 'The Whispering Clockwork Atrium',
    genre: 'Steampunk Gothic',
    tone: 'Intriguing, ticking, botanical',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    description: 'A Victorian glass dome overtaken by exotic bioluminescent ferns and brass gear-driven mechanical insects.',
    cachedAnalysis: {
      visualAnalysis: {
        mood: 'Whimsical Victorian Secrecy',
        setting: 'The Grand Botanicum at Rookwood Manor',
        atmosphere: 'Warm greenhouse humidity, earthy petrichor mingled with machine oil and jasmine',
        colorPalette: ['#14532d', '#b45309', '#fef08a', '#475569'],
        sensoryDetails: [
          'Rhythmic syncopated ticking of a thousand miniature copper escapements',
          'Heavy damp heat settling on bare skin under cathedral glass panes',
          'Sweet, suffocating fragrance of midnight orchids blooming out of season',
          'Subtle whirr of brass-winged dragonflies patrolling the high glass canopy'
        ],
        keyFocalPoints: [
          'A massive grandfather clock whose weights are suspended over a dark lily pond',
          'Vines coiling around exposed brass cogwheels, halting the pendulum',
          'An open journal on a potting bench with hastily drawn botanical schematics'
        ]
      },
      story: {
        title: 'The Heart That Kept Rookwood Alive',
        genre: 'Steampunk Gothic',
        openingParagraph: 'Every living fern in the Grand Botanicum was a liar, and Arthur knew it the second he touched the silver-veined leaf. It didn’t yield like organic cellulose; it hummed with the delicate, micro-tuned vibration of thirty-two jeweled gears. High above, through the fogged emerald panels of the Victorian dome, moonlight caught the pendulum of the estate’s master escapement. It was slowing. With every sluggish swing, the bioluminescent orchids dimmed, threatening to plunge the entire conservatory into the very darkness Lord Rookwood had died trying to cage.',
        narrativeHooks: [
          'What truth did Lord Rookwood hide beneath the roots of the central clock-tree?',
          'Why are the brass dragonflies starting to mimic human voices?',
          'Who wound the clock if Arthur was the only living soul in the manor?'
        ],
        worldLoreSnippet: 'The Rookwood dynasty pioneered botanical automata, grafting mechanical escapements into rare flora to preserve extinct ecosystems.'
      },
      suggestedVoice: {
        voiceName: 'Puck',
        styleInstruction: 'Intrigued, nimble, curious, and whimsical with subtle theatrical suspense'
      }
    }
  }
];
