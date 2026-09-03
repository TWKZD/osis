import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, provider } = req.body;

      const apiKey = provider?.apiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("API Key tidak dikonfigurasi. Harap atur API Key di Panel Admin atau Vercel Environment Variables.");
      }

      const baseUrl = provider?.baseUrl || "https://api.groq.com/openai/v1/chat/completions";
      const model = provider?.model || "openai/gpt-oss-20b";

      const fetchUrl = baseUrl || "https://api.groq.com/openai/v1/chat/completions";
      const fetchModel = model || "openai/gpt-oss-20b";
      
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: fetchModel.trim(),
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Upstream API Error:", response.status, errText);
        throw new Error(`Gagal menghubungi AI (${response.status}). Periksa kembali API Key dan Base URL Anda. Detail: ${errText.substring(0, 100)}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error?.message || "Failed to fetch response" });
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
