import { GoogleGenerativeAI } from "@google/generative-ai";
const dotenv = require("dotenv");
import Groq from "groq-sdk";
import { instructions_prompt_enhancer as instructions } from "./instructions";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// prompt: user question
//  instruction: how to behave
export async function generateTextTotitleWithGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([instructions, prompt]);
  return result.response.text();
}

// Gorq gen AI model
export async function enhancePromptWithGroq(prompt: any, diagramType: string = "auto") {
  const ai_model = "meta-llama/llama-4-scout-17b-16e-instruct";
  const chatCompletion = await getGroqChatCompletion(prompt, ai_model, diagramType);

  // Print the completion returned by the LLM.
  return chatCompletion.choices[0]?.message?.content || "";
}

// grok config
const getGroqChatCompletion = async (prompt: string, ai_model: string, diagramType: string = "auto") => {
  // Create diagram type specific instruction
  let diagramTypeInstruction = "";
  if (diagramType !== "auto") {
    diagramTypeInstruction = `\n\nIMPORTANT: The user has specifically requested a ${diagramType} diagram. Please enhance the prompt to generate a ${diagramType} diagram type specifically.`;
  }
  return groq.chat.completions.create({
    //
    // Required parameters
    //
    messages: [
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: instructions + diagramTypeInstruction,
      },
      // Set a user message for the assistant to respond to.
      {
        role: "user",
        content: prompt,
      },
    ],

    // The language model which will generate the completion.
    model: ai_model,

    //
    // Optional parameters
    //

    // Controls randomness: lowering results in less random completions.
    // As the temperature approaches zero, the model will become deterministic
    // and repetitive.
    temperature: 0.5,

    // The maximum number of tokens to generate. Requests can use up to
    // 2048 tokens shared between prompt and completion.
    max_completion_tokens: 1024,

    // Controls diversity via nucleus sampling: 0.5 means half of all
    // likelihood-weighted options are considered.
    top_p: 1,

    // A stop sequence is a predefined or user-specified text string that
    // signals an AI to stop generating content, ensuring its responses
    // remain focused and concise. Examples include punctuation marks and
    // markers like "[end]".
    stop: null,

    // If set, partial message deltas will be sent.
    stream: false,
  });
};
