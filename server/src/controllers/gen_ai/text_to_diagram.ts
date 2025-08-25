import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";

import { instructions_text_to_diagram as instructions } from "./instructions";

const dotenv = require("dotenv");

// config
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


// Google Gen AI Model
export async function generateTextToDiagramWithGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([instructions, prompt]);
  return result.response.text();
}

// Groq gen AI model
export async function generateTextToDiagramWithGroq(
  prompt: any,
  ai_model: string,
  diagramType: string = "auto"
) {
  console.log(ai_model);
  
  try {
    const chatCompletion = await getGroqChatCompletion(prompt, ai_model, diagramType);

    console.log(chatCompletion.choices[0]?.message?.content);

    // Print the completion returned by the LLM.
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.log(error.message);
  }
}

// Anthropic AI model
export async function generateTextToDiagramWithAnthropic(
  prompt: string,
  ai_model: string = "claude-sonnet-4-20250514"
) {
  console.log(ai_model);
  
  try {
    const chatCompletion = await getAnthropicChatCompletion(prompt, ai_model);

    // Extract text from the response array
    const responseText = chatCompletion;
    console.log(responseText);

    // Print the completion returned by the LLM.
    return responseText;
  } catch (error) {
    console.log(error.message);
  }
}

// Groq config
const getGroqChatCompletion = async (prompt: string, ai_model: string, diagramType: string = "auto") => {
  // Create diagram type specific instruction
  let diagramTypeInstruction = "";
  if (diagramType !== "auto") {
    const diagramTypeMap: Record<string, string> = {
      "flowchart": "flowchart",
      "sequence": "sequence diagram", 
      "class": "class diagram",
      "state": "state diagram",
      "er": "entity relationship diagram",
      "gantt": "gantt chart",
      "pie": "pie chart",
      "journey": "user journey diagram",
      "mindmap": "mindmap",
      "timeline": "timeline diagram",
      "gitgraph": "git graph",
      "c4": "C4 diagram"
    };
    const diagramName = diagramTypeMap[diagramType] || diagramType;
    diagramTypeInstruction = `\n\nIMPORTANT: You MUST generate a ${diagramName} specifically. Do not generate any other type of diagram.`;
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

// Anthropic config
const getAnthropicChatCompletion = async (prompt: string, ai_model: string) => {
  return anthropic.messages.create({
    model: ai_model,
    max_tokens: 1024,
    temperature: 0.5,
    system: instructions,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ]
  });
};