import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

// Create a single client object
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Access API methods through services on the client object
const response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: "Tell about the history of chatrapati sambhaji maharaj. Include key events, achievements, and his legacy.",
});
console.log(response.text);
