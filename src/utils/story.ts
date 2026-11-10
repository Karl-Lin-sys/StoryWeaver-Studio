/**
 * Story and Prose calculation utilities
 */

export interface StoryAnalysisData {
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
}

/**
 * Calculates word count from a text string
 */
export function calculateWordCount(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

/**
 * Estimates reading time in minutes (based on standard 200 words per minute)
 */
export function estimateReadingTime(text: string, wordsPerMinute = 200): number {
  const words = calculateWordCount(text);
  if (words === 0) return 0;
  return Math.max(0.5, Math.round((words / wordsPerMinute) * 10) / 10);
}

/**
 * Generates prompt ideas tailored to a selected literary genre
 */
export function getGenrePrompts(genre: string): string[] {
  const normalized = genre.toLowerCase();
  if (normalized.includes('cyberpunk') || normalized.includes('sci-fi')) {
    return [
      'What neon secret is hidden behind the alley advertisement?',
      'Who is hunting the protagonist through this rain-soaked quarter?',
      'Describe the humming cyberware implant malfunctioning in the cold.'
    ];
  }
  if (normalized.includes('fantasy') || normalized.includes('magic')) {
    return [
      'What ancient magical vow was broken here a thousand years ago?',
      'Describe the strange creature watching from the moss-covered canopy.',
      'What relic is buried beneath the temple altar?'
    ];
  }
  if (normalized.includes('gothic') || normalized.includes('horror')) {
    return [
      'What sinister whisper drifts through the decaying manor hallway?',
      'Who left the candle burning by the locked cellar door?',
      'What curse awakens every time the autumn fog rolls in?'
    ];
  }
  return [
    'Introduce a sudden conflict that disrupts this peaceful stillness.',
    'Describe what the protagonist smells and hears in this moment.',
    'Reveal a shocking object held in the protagonist\'s trembling hand.'
  ];
}

/**
 * Formats manuscript for export as clean Markdown
 */
export function formatStoryMarkdown(analysis: StoryAnalysisData, customOpening?: string): string {
  const opening = customOpening ?? analysis.story.openingParagraph;
  return `# ${analysis.story.title}
*Genre: ${analysis.story.genre}*
*Mood: ${analysis.visualAnalysis.mood} | Setting: ${analysis.visualAnalysis.setting}*

---

${opening}

---

### World Lore & Atmosphere
${analysis.story.worldLoreSnippet}

### Sensory Cues
${analysis.visualAnalysis.sensoryDetails.map(item => `- ${item}`).join('\n')}

### Narrative Hooks
${analysis.story.narrativeHooks.map(item => `- ${item}`).join('\n')}
`;
}
