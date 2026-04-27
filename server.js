import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured in .env" });
  }

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const payload = {
    systemInstruction: {
      parts: [
        {
          text: "You are a travel guide chatbot. Answer only travel-related questions. If the user asks anything outside travel, reply exactly: Ask questions related to Travel only."
        }
      ]
    },
    contents: [
      {
        parts: [
          {
            text: userMessage
          }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: 512
    }
  };

  try {
    const response = await fetch(`${apiUrl}${apiUrl.includes("?") ? "&" : "?"}key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "Gemini API request failed", details: errorText });
    }

    const data = await response.json();
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response.";

    res.json({ reply: message });
  } catch (error) {
    res.status(500).json({ error: "Request failed", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Travel Guide Chatbot listening at http://localhost:${port}`);
});
