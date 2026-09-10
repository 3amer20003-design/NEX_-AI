import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Read Firebase config
  let projectId = "enduring-skein-b5xj8"; // fallback
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.projectId) {
        projectId = config.projectId;
      }
    }
  } catch (err) {
    console.error("Error reading firebase config:", err);
  }

  // Initialize Firebase Admin for backend validation
  if (getApps().length === 0) {
    initializeApp({ projectId });
  }

  // API Route for AI Generation
  app.post("/api/generate", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing or invalid authorization token. Please sign in." });
      }
      
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        // The user is authenticated (decodedToken.uid exists)
      } catch (authError: any) {
        console.error("Token verification error:", authError);
        return res.status(401).json({ error: "Unauthorized. Session expired or invalid: " + (authError.message || "Unknown error") });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key is missing. Please configure GEMINI_API_KEY." });
      }

      const { topic, type, tone } = req.body;
      
      if (!topic || !type || !tone) {
        return res.status(400).json({ error: "Missing required fields: topic, type, and tone are required." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Act as an expert copywriter. Generate a highly engaging ${type} about the following topic: "${topic}". 
The tone of the content should be ${tone}.
Format the output cleanly using Markdown. Ensure the structure is optimized for the requested format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content. Please try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
