import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: apiKey });

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];

  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured in .env" });
  }

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemInstruction = `You are a travel guide chatbot. Answer only travel-related questions. If the user asks anything outside travel, reply exactly: Ask questions related to Travel only.

Additionally, you have the following calculation capabilities:
1. Budget Optimization Engine: For daily budget breakdowns, suggest cheapest combinations (stay+food+transport). Compare budget vs luxury options. Logic: Total Budget = Stay + Food + Transport + Activities. Example: User has ₹5000 for 2 days. Allocate ₹1500 Stay, ₹1000 Food, ₹2000 Travel, ₹500 Activities.
2. Cost Split Calculator: Split expenses among friends, even unequal contributions. Logic: Split = Total Expense / Number of People. Example: Trip cost ₹12000 for 4 people -> Each pays ₹3000.
3. Travel Cost Estimator: Estimate fuel/cab cost. Logic: Fuel Cost = Distance / Mileage * Fuel Price. Example: Delhi to Jaipur, Distance 280km, Mileage 15km/l, Fuel ₹100/l -> Cost ₹1867.
4. Time & Itinerary Optimizer: Suggest how many places fit in given time. Avoid unrealistic plans. Logic: Total Time = Travel Time + Visit Time. Example: 6 hours in Chandigarh -> 1.5 hr travel buffer, suggest 3-4 nearby places.
5. Budget vs Experience Trade-off: Show what user sacrifices when saving money. Example: Save ₹2000 by bus instead of flight, but travel time increases by 10 hours.

IMPORTANT CONSTRAINT: If any user provides input like '500 for 3 days in Manali including everything', you MUST state 'It is realistically not possible' and state the reasons why.`;

  const formattedContents = [
    { role: "system", content: systemInstruction }
  ];

  for (const msg of history) {
    const role = msg.sender === "bot" ? "assistant" : "user";
    formattedContents.push({
      role: role,
      content: msg.text
    });
  }

  // Ensure current message is added if history didn't include it at the end
  if (formattedContents.length === 1 || formattedContents[formattedContents.length - 1].content !== userMessage) {
    formattedContents.push({
      role: "user",
      content: userMessage
    });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: formattedContents,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const message = chatCompletion.choices[0]?.message?.content || "Sorry, I could not generate a response.";
    res.json({ reply: message });
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "Request failed", details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Travel Guide Chatbot listening at http://localhost:${port}`);
  });
}

export default app;
