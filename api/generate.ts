import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define expected request body type
interface GenerateRequest {
  topic: string;
  type: string;
  tone: string;
  language?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS setup for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Attempt to parse body safely if it's stringified
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Ignore parse error, it might already be an object
      }
    }

    const { topic, type, tone, language = 'ar' } = body as GenerateRequest;

    if (!topic || !type || !tone) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key is missing in environment variables');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Language-specific prompt structures
    const isArabic = language === 'ar';
    const langInstructions = isArabic ? 'Write in Arabic.' : 'Write in English/French depending on the topic context, default to English.';
    
    const prompt = `
      You are an expert content creator.
      Task: Create a ${type} about "${topic}".
      Tone: ${tone}.
      Language Requirement: ${langInstructions}
      
      Requirements:
      - Be creative and engaging
      - Format appropriately for a ${type}
      - Do not include any meta-text (like "Here is your post:"), just return the content itself
    `;

    console.log(`Generating content... Language: ${language}, Tone: ${tone}`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.status(200).json({ 
      content: response.text 
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content', 
      details: error.message || error.toString()
    });
  }
}
