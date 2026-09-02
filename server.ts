import express from "express";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

// Initialize Firebase for the server using the applet config
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const firebaseApp = initializeApp(firebaseConfig, "server-app");
const db = getFirestore(firebaseApp);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Since we are behind a proxy, this ensures rate limiting works correctly with real IPs
  app.set("trust proxy", 1);
  
  app.use(cors());
  app.use(express.json());

  // 1. Rate Limiting: Max 3 requests per 10 minutes per IP
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 3, 
    message: { error: "Terlalu banyak mengirim aspirasi. Silakan tunggu beberapa menit lagi." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 2. Moderation: List of bad words
  const BAD_WORDS = ["anjing", "babi", "goblok", "tolol", "bangsat", "bodoh", "jancok", "kontol", "memek"];

  // API Endpoint to submit aspirations securely
  app.post("/api/aspirations", apiLimiter, async (req, res) => {
    try {
      const { category, subject, message, isAnonymous, authorName, captcha } = req.body;

      // 3. Captcha Verification (Math Captcha)
      if (!captcha || captcha.num1 + captcha.num2 !== parseInt(captcha.answer)) {
        return res.status(400).json({ error: "Jawaban keamanan (Captcha) salah! Buktikan kamu manusia." });
      }

      // 4. Basic Moderation
      const content = `${subject} ${message}`.toLowerCase();
      const hasBadWord = BAD_WORDS.some(word => content.includes(word));
      if (hasBadWord) {
        return res.status(400).json({ error: "Maaf, pesan Anda mengandung kata-kata yang tidak pantas. Harap gunakan bahasa yang sopan." });
      }

      // Prepare payload
      const payload = {
        category,
        subject,
        message,
        isAnonymous,
        ...(isAnonymous ? {} : { authorName }),
        status: "Pending",
        createdAt: serverTimestamp(),
        // SECRET KEY: this must match the Firestore security rules to allow writes
        serverSecret: "osis_secure_2026",
      };

      await addDoc(collection(db, "aspirations"), payload);
      res.json({ success: true, message: "Aspirasi berhasil dikirim" });
    } catch (error) {
      console.error("Error saving aspiration:", error);
      res.status(500).json({ error: "Gagal memproses aspirasi ke database." });
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
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
