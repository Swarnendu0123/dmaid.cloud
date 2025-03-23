import { GoogleGenerativeAI } from "@google/generative-ai";
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// prompt: user question
//  instruction: how to behave
export async function generateTitle(prompt: string) {
  const instructions = `
          You are an expert at converting English descriptions into concise and meaningful Mermaid.js diagram titles.
      
          Examples:
          
          1. Input: "Generate a client-server architecture-based Mermaid code."
             Output: "Client-Server Architecture"
      
          2. Input: "Show the login process from the user to the authentication server and database."
             Output: "Login Process Flow Diagram"
      
          Guidelines:
          - Generate clear, valid, and relevant titles.
          - Keep titles concise yet descriptive.
          - Use title case for proper formatting.
          - Do not use any Quotes (" or ') in the output.
        `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([instructions, prompt]);
  return result.response.text();
}
