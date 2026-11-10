import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { validateImageUpload, sanitizePromptText, getNistCsfSummary, checkTaiwanLegalCompliance } from './src/utils/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// NIST CSF PR.DS-1: Enforce payload size limit to prevent memory exhaustion & DoS
app.use(express.json({ limit: '15mb' }));

// NIST CSF PR.PT-1: Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Shared server-side Gemini client (Never exposed to client)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// -------------------------------------------------------------
// API: Analyze Image & Ghostwrite Opening Story Paragraph
// Required model: gemini-4-argon for image understanding & story
// -------------------------------------------------------------
app.post('/api/analyze-and-write', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, genre = 'Speculative Fiction', tone = 'Atmospheric & Evocative' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Missing imageBase64 payload.' });
      return;
    }

    const cleanMime = (mimeType || 'image/jpeg').toLowerCase();
    const approxBytes = Math.round((imageBase64.length * 3) / 4);

    // NIST validation
    const validation = validateImageUpload({ size: approxBytes, type: cleanMime });
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const imagePart = {
      inlineData: {
        mimeType: cleanMime,
        data: imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
      },
    };

    const promptText = `
You are a master worldbuilder and award-winning fiction author.
Analyze this image thoroughly for setting, mood, lighting, environmental details, textures, color dynamics, and hidden narrative potential.
Then, ghostwrite an unforgettable, deeply atmospheric opening paragraph (150-240 words) to an epic story set directly within this world.

Requested genre influence: ${genre}
Requested tonal atmosphere: ${tone}

Return your analysis in valid JSON matching this schema:
{
  "visualAnalysis": {
    "mood": "Short 2-4 word mood descriptor (e.g., 'Foreboding Neon Melancholy')",
    "setting": "Specific setting name / environment description",
    "atmosphere": "Atmospheric sensory summary (weather, air, light quality)",
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "sensoryDetails": [
      "Tactile / olfactory / auditory detail 1",
      "Detail 2",
      "Detail 3",
      "Detail 4"
    ],
    "keyFocalPoints": [
      "Focal point 1",
      "Focal point 2",
      "Focal point 3"
    ]
  },
  "story": {
    "title": "Evocative and memorable story title",
    "genre": "${genre}",
    "openingParagraph": "The compelling opening paragraph. Immersive, rich prose with arresting imagery, voice, and subtle conflict.",
    "narrativeHooks": [
      "Unresolved question 1 for the reader",
      "Potential conflict 2",
      "Foreshadowed secret 3"
    ],
    "worldLoreSnippet": "2-3 sentences of worldbuilding lore explaining how this place came to be or what rules govern it."
  },
  "suggestedVoice": {
    "voiceName": "One of: Kore, Fenrir, Puck, Zephyr, Charon",
    "styleInstruction": "Instruction for how to narrate this story (e.g. 'Slow, haunting, gravelly cadence with breathless suspense')"
  }
}
`;

    // Try primary required model gemini-4-argon; fallback to gemini-3.8-flash if model unavailable
    let response;
    let modelUsed = 'gemini-4-argon';

    try {
      response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: {
          parts: [imagePart, { text: promptText }],
        },
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an acclaimed novelist and cinematic art director. Always return strictly valid JSON.',
        },
      });
    } catch (primaryErr: any) {
      console.warn('gemini-4-argon call failed, attempting fallback to gemini-3.8-flash:', primaryErr?.message);
      modelUsed = 'gemini-3.8-flash';
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [imagePart, { text: promptText }],
        },
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an acclaimed novelist and cinematic art director. Always return strictly valid JSON.',
        },
      });
    }

    const rawJson = (response.text ?? '{}').trim();
    const parsedData = JSON.parse(rawJson);

    res.json({
      success: true,
      modelUsed,
      data: parsedData,
    });
  } catch (err: any) {
    console.error('Error analyzing image & writing story:', err);
    res.status(500).json({
      error: err?.message || 'Failed to analyze image and generate story.',
    });
  }
});

// -------------------------------------------------------------
// API: Text-to-Speech Narration
// Required model: gemini-3.8-flash-tts
// -------------------------------------------------------------
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore', speakerStyle } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text prompt is required for narration.' });
      return;
    }

    const sanitized = sanitizePromptText(text, 1200);
    const validVoices = ['Kore', 'Fenrir', 'Puck', 'Zephyr', 'Charon'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const styleDesc = speakerStyle || 'Expressive, immersive literary audiobook narrator with evocative cadence, clear emotion, and dramatic pacing';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: sanitized,
              speechMetadata: {
                style: styleDesc,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({ error: 'No audio data returned by TTS model.' });
      return;
    }

    // Unary default returns complete WAV file with 44-byte RIFF header (24kHz, mono, 16-bit)
    res.json({
      success: true,
      mimeType: 'audio/wav',
      audioData: `data:audio/wav;base64,${base64Audio}`,
      voiceName: chosenVoice,
    });
  } catch (err: any) {
    console.error('Error generating TTS:', err);
    res.status(500).json({
      error: err?.message || 'Failed to synthesize narration audio.',
    });
  }
});

// -------------------------------------------------------------
// API: Multi-turn Chatbot (Story Workshop & Co-Author)
// Required models:
// - gemini-4-argon for particularly complex tasks
// - gemini-3.8-flash for general tasks
// - gemini-3.1-flash-lite for tasks that should happen fast
// -------------------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemRole = 'editor',
      modelChoice = 'gemini-3.8-flash',
      storyContext = '',
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    // Assign role system instructions
    const roleInstructions: Record<string, string> = {
      editor: `You are a Senior Literary Editor and prose craftsman. Your role is to help the author elevate their story. Analyze prose rhythm, sentence cadence, word choice, sensory depth, and pacing. Suggest specific line revisions or alternative phrases when asked. Be encouraging, precise, and constructively insightful.`,
      worldbuilder: `You are a Master World Architect specializing in speculative fiction, mythologies, magic systems, technology levels, and social factions. Help the author invent cohesive lore, historical antecedents, cultural customs, and environmental mysteries that expand naturally from the established image and opening scene.`,
      expander: `You are a Creative Fiction Ghostwriter and scene weaver. When the user asks for the next scene beat, dialogue exchange, or character introduction, write evocative, gripping prose that flows seamlessly from the opening paragraph, matching its tone, vocabulary, and suspense.`,
      rapid: `You are a Fast-Paced Brainstorming Partner. Deliver high-energy, rapid-fire creative hooks, character concepts, unexpected plot twists, sensory motifs, and thematic symbols in concise, bulleted sparks.`,
    };

    const baseInstruction = roleInstructions[systemRole] || roleInstructions.editor;
    const fullSystemInstruction = `${baseInstruction}

Current Story Context:
${storyContext ? storyContext.slice(0, 1500) : 'None established yet.'}

Guidelines:
- Maintain authorial tone and consistency with the story world.
- Format responses cleanly with Markdown (paragraphs, bullet points, italics for prose samples).
- Keep replies engaging, focused, and immediately actionable for the writer.`;

    // Map requested model choice or fallback safely
    let targetModel = 'gemini-3.8-flash';
    if (modelChoice === 'gemini-4-argon') {
      targetModel = 'gemini-4-argon';
    } else if (modelChoice === 'gemini-3.1-flash-lite') {
      targetModel = 'gemini-3.1-flash-lite';
    }

    // Convert message history to Gemini API format
    // Filter out invalid items and map role
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: sanitizePromptText(m.content || '', 3000) }],
    }));

    let response;
    let actualModel = targetModel;

    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
        },
      });
    } catch (modelErr: any) {
      console.warn(`Error using ${targetModel}, falling back to gemini-3.8-flash:`, modelErr?.message);
      actualModel = 'gemini-3.8-flash';
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
        },
      });
    }

    const replyText = response.text || 'I could not generate a reply at this time.';

    res.json({
      success: true,
      reply: replyText,
      modelUsed: actualModel,
    });
  } catch (err: any) {
    console.error('Error in chat:', err);
    res.status(500).json({
      error: err?.message || 'Chat service encountered an error.',
    });
  }
});

// -------------------------------------------------------------
// API: NIST CSF & Compliance Audit endpoint
// -------------------------------------------------------------
app.get('/api/compliance-status', (_req: Request, res: Response) => {
  res.json({
    framework: 'NIST Cybersecurity Framework (CSF 2.0)',
    taiwanLegal: checkTaiwanLegalCompliance(),
    nistCategories: getNistCsfSummary(),
    serverTime: new Date().toISOString(),
    status: 'HEALTHY',
    apiProxyStatus: apiKey ? 'CONFIGURED (Server-Side Isolated)' : 'PENDING_KEY',
  });
});

// -------------------------------------------------------------
// Vite middleware mounting & Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StoryWeaver server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
