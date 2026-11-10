import test from 'node:test';
import assert from 'node:assert/strict';
import { validateImageUpload, sanitizePromptText, getNistCsfSummary, checkTaiwanLegalCompliance } from './security';
import { calculateWordCount, estimateReadingTime, getGenrePrompts, formatStoryMarkdown, StoryAnalysisData } from './story';

test('security: validateImageUpload accepts valid JPEG and PNG within size limit', () => {
  const validJpeg = validateImageUpload({ size: 1024 * 500, type: 'image/jpeg' });
  assert.equal(validJpeg.valid, true);
  assert.equal(validJpeg.sanitizedMime, 'image/jpeg');

  const validPng = validateImageUpload({ size: 1024 * 1024, type: 'image/png' });
  assert.equal(validPng.valid, true);
});

test('security: validateImageUpload rejects unsupported types and oversized files', () => {
  const exeFile = validateImageUpload({ size: 1000, type: 'application/x-msdownload' });
  assert.equal(exeFile.valid, false);
  assert.match(exeFile.error ?? '', /Unsupported file type/);

  const oversized = validateImageUpload({ size: 15 * 1024 * 1024, type: 'image/jpeg' });
  assert.equal(oversized.valid, false);
  assert.match(oversized.error ?? '', /exceeds maximum allowed limit/);

  const empty = validateImageUpload({ size: 0, type: 'image/png' });
  assert.equal(empty.valid, false);
});

test('security: sanitizePromptText removes control characters and clamps length', () => {
  const dirty = 'Hello\x00\x08World!\nLine 2';
  const clean = sanitizePromptText(dirty, 20);
  assert.equal(clean.includes('\x00'), false);
  assert.equal(clean.includes('\x08'), false);
  assert.equal(clean.length <= 20, true);
});

test('security: NIST CSF summary returns all 6 core categories', () => {
  const csf = getNistCsfSummary();
  assert.equal(csf.length, 6);
  const ids = csf.map(c => c.name);
  assert.equal(ids.some(n => n.includes('Govern')), true);
  assert.equal(ids.some(n => n.includes('Protect')), true);
});

test('security: Taiwan legal compliance checklist is valid', () => {
  const taiwan = checkTaiwanLegalCompliance();
  assert.equal(taiwan.pdpaCompliant, true);
  assert.equal(taiwan.copyrightCompliant, true);
  assert.equal(taiwan.exportLicense, 'MIT License');
});

test('story: calculateWordCount correctly counts tokens', () => {
  assert.equal(calculateWordCount(''), 0);
  assert.equal(calculateWordCount('The rain tapped against the neon window.'), 7);
  assert.equal(calculateWordCount('   One   two   three   '), 3);
});

test('story: estimateReadingTime computes proportional reading duration', () => {
  const text = 'word '.repeat(200); // 200 words = 1.0 minute
  assert.equal(estimateReadingTime(text), 1);
  assert.equal(estimateReadingTime(''), 0);
});

test('story: getGenrePrompts returns genre-specific creative prompts', () => {
  const cyberpunk = getGenrePrompts('cyberpunk noir');
  assert.equal(cyberpunk.length > 0, true);
  assert.match(cyberpunk[0], /neon/i);

  const fantasy = getGenrePrompts('high fantasy');
  assert.match(fantasy[0], /magical/i);
});

test('story: formatStoryMarkdown formats clean Markdown with metadata', () => {
  const mockAnalysis: StoryAnalysisData = {
    visualAnalysis: {
      mood: 'Eerie',
      setting: 'Abandoned Lighthouse',
      atmosphere: 'Foggy twilight',
      colorPalette: ['#1e293b', '#f59e0b'],
      sensoryDetails: ['Salt spray in the air', 'Creaking floorboards'],
      keyFocalPoints: ['Rotting spiral stairs', 'Cracked lantern glass']
    },
    story: {
      title: 'Whispers of the Black Beacon',
      genre: 'Gothic Mystery',
      openingParagraph: 'The sea did not forgive the lightkeeper.',
      narrativeHooks: ['A sealed brass compass on the table'],
      worldLoreSnippet: 'Built in 1842 during the Great Eclipse.'
    },
    suggestedVoice: {
      voiceName: 'Fenrir',
      styleInstruction: 'Low and brooding'
    }
  };

  const md = formatStoryMarkdown(mockAnalysis);
  assert.match(md, /# Whispers of the Black Beacon/);
  assert.match(md, /The sea did not forgive the lightkeeper/);
  assert.match(md, /Built in 1842/);
});
