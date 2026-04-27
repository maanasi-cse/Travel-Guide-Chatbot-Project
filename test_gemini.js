import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const payload = {
  systemInstruction: {
    parts: [
      {
        text: "You are a travel guide chatbot. Answer only travel-related questions."
      }
    ]
  },
  contents: [
    {
      parts: [
        {
          text: "bali"
        }
      ]
    }
  ],
  generationConfig: {
    maxOutputTokens: 512
  }
};

async function test() {
  console.log("Sending request...");
  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Details:", errorText);
  } else {
    const data = await response.json();
    console.log("Success:", JSON.stringify(data, null, 2));
  }
}

test();
