require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

// Konfigurasi CORS diperkuat agar aman untuk semua origin (termasuk localhost:5173)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.AI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      prompt,
      activeTab = "General",
      patientContext = {}
    } = req.body;

    const systemInstruction = `
Anda adalah Clinical AI Assistant v4.

Tugas:
- membantu dokter
- membantu apoteker
- membantu mahasiswa farmasi
- evidence based
- jangan mengarang
- gunakan bahasa user

Modul aktif:
${activeTab}

Data pasien:
${JSON.stringify(patientContext.patient ?? {}, null, 2)}

Clinical Context:
${JSON.stringify(patientContext.clinicalContext ?? {}, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Diperbaiki dari "gemini-3.6-flash" ke model flash yang valid
      contents: `${systemInstruction}

User:
${prompt}`
    });

    res.json({
      reply: response.text
    });

  } catch (err) {
    console.error("AI Backend Error:", err);
    res.status(500).json({
      reply: "AI sedang mengalami gangguan pada server."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AI Backend Running on port ${PORT}`);
});