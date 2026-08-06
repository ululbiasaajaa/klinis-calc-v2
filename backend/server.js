require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
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
      model: "gemini-3.6-flash",
      contents: `${systemInstruction}

User:
${prompt}`
    });

    res.json({
      reply: response.text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "AI sedang mengalami gangguan."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 AI Backend Running");
});