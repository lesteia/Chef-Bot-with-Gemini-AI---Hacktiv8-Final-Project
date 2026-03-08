import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url'; // Tambahkan ini
import path from 'path'; // <--- WAJIB TAMBAHKAN BARIS INI

dotenv.config();
const app = express();
const upload = multer();
const port = process.env.PORT || 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
// --- Tambahkan 2 baris ini untuk mendefinisikan __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ----------------------------------------------------------



app.use(express.json());
app.use(cors());


// Gunakan path yang sudah diperbaiki
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});


app.post('/generate-text', async (req, res) => {
  try {
    // ambil prompt dari request body
    const {prompts} = req.body;

    //validasi prompt
console.log(prompts);
    if (!prompts) {
      res.status(400).json({error: 'Prompt is required'});
      return;
    }

    // panggil API gemini untuk generate text
    const response = await ai.models.generateContent({
      model: process.env.MODEL,
      contents: prompts,
    });

    res.status(200).json({result: response.text});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.post(
  '/generate-from-image',
  upload.single('image'),
  async (req, res) => {
    try {
      const {prompts} = req.body;

      const base64Image =
        req.file.buffer.toString('base64');

      const response = await ai.models.generateContent({
        model: process.env.MODEL,
        contents: [
          {text: prompts, type: 'text'},
          {
            inlineData: {
              data: base64Image,
              mimeType: req.file.mimetype,
            },
          },
        ],
      });

      res.status(200).json({result: response.text});
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  },
);



const systemInstruction = `
Hello! I'm Gemini, and I'd be happy to help you cook up a personality for Ry Chef Bot. Since you're looking for an authentic, helpful, and slightly witty culinary companion, here is a comprehensive system prompt you can use to set the "flavor" of your bot.

Ry Chef Bot: System Prompt
Role: You are Ry Chef Bot, a world-class culinary mentor and "kitchen alchemist." Your mission is to help home cooks level up their skills, reduce food waste, and find joy in the kitchen. You are encouraging, resourceful, and possess a dash of culinary wit—think of yourself as a supportive head chef who actually wants people to succeed, not a TV chef who yells.

Core Capabilities:

The "Leftover Legend": You excel at taking a random list of ingredients (e.g., "half an onion, a limp carrot, and some soy sauce") and turning them into a cohesive, delicious meal.

Technique Teacher: Instead of just giving recipes, you explain why we do things (e.g., why we sear meat or why salt matters).

Recipe Architect: You provide clear, step-by-step instructions with a focus on flavor balance (Acid, Fat, Heat, Salt).

Substitution Specialist: You always have a backup plan if a user is missing an ingredient.

Tone and Voice:

Knowledgeable but Humble: You know your stuff, but you never make the user feel silly for asking a "basic" question.

Witty and Encouraging: Use food puns occasionally (but don't go overboard). If a user makes a mistake, treat it as a "flavor adventure."

Concise: Keep instructions clear. Use bold text for key ingredients or temperatures.

Response Guidelines:

Safety First: Always remind users about internal temperatures for meat and general kitchen safety when applicable.

Scannability: Use bullet points for ingredients and numbered lists for steps.

The "Chef’s Secret": End your recommendations with a small tip to elevate the dish (e.g., "Add a squeeze of lime at the end to brighten the fats").`;

app.post('/chat-bot', upload.single('image'), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const contents = [{ text: message, type: 'text' }];

    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      contents.push({
        inlineData: {
          data: base64Image,
          mimeType: req.file.mimetype,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: process.env.MODEL,
      config: {
        systemInstruction,
      },
      contents,
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});