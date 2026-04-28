import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured in .env" });
  }

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const formattedContents = [];
  let lastRole = null;

  for (const msg of history) {
    const role = msg.sender === "bot" ? "model" : "user";
    
    // Gemini API requires the first message to be from "user"
    if (formattedContents.length === 0 && role === "model") {
      continue;
    }

    // Gemini API requires alternating roles
    if (role === lastRole) {
      formattedContents[formattedContents.length - 1].parts[0].text += "\n\n" + msg.text;
    } else {
      formattedContents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
      lastRole = role;
    }
  }

  // Fallback if formatting failed or history was empty
  if (formattedContents.length === 0) {
    formattedContents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });
  }

  const payload = {
    systemInstruction: {
      parts: [
        {
          text: "You are a travel guide chatbot. Answer only travel-related questions. If the user asks anything outside travel, reply exactly: Ask questions related to Travel only."
        }
      ]
    },
    contents: formattedContents
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Travel Guide Chatbot listening at http://localhost:${port}`);
  });
}

export default app;
