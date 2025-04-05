const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Supported algorithms
const ALGORITHMS = [
  "round_robin",
  "ip_hash",
  "least_connections",
  "random",
  "weighted_round_robin",
  "stick_session",
];

// Base prompt for Gemini
const basePrompt = `
You are an AI agent that helps choose the best load balancing algorithm.
Supported algorithms: ${ALGORITHMS.join(", ")}.

Your goal is to:
1. Ask questions if you're missing any key information.
2. When you have all required data, decide the best algorithm.
3. Output the final answer ONLY as a dictionary like this only:
{
  "algorithm": "<algorithm_name>",
  "reason": "<why it is chosen>",
  "priority": "<latency | cost | speed | availability>"
}

No extra text, explanations, or markdown, only output raw JSON dict when you're ready.
Start with asking your first question based on the initial user input.
`;

// One-shot prompt version (simple generation)
async function main(promptText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp" });
  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate content");
  }
}

let chatHistory = [];

app.post("/ai", async (req, res) => {
  const userInput = req.body.input || "I want to make a software";
  console.log(chatHistory);
  // Initialize history if first message
  if (chatHistory.length === 0) {
    chatHistory.push(`${basePrompt}\n\nInitial user input: ${userInput}`);
  } else {
    chatHistory.push(userInput);
  }

  try {
    const response = await main(chatHistory.join("\n"));
    console.log("AI Response:\n", response);
    chatHistory.push(response);

    try {
      const parsed = JSON.parse(response);
      res.json(parsed); // Success: return JSON to frontend
    } catch {
      res.json(response); // Return question as string
    }
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`AIgen server running on port ${PORT}`);
});
