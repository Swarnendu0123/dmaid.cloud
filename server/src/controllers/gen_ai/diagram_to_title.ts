import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";

const dotenv = require("dotenv");
import { instructions_diagram_to_title as instructions } from "./instructions";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Groq AI model function
export async function generateDiagramToTitleWithGroq(prompt: any) {
  const ai_model = "meta-llama/llama-4-scout-17b-16e-instruct";
  const chatCompletion = await getGroqChatCompletion(prompt, ai_model);

  console.log(chatCompletion.choices[0]?.message?.content);

  // Print the completion returned by the LLM.
  return chatCompletion.choices[0]?.message?.content || "";
}

// Anthropic AI model function
export async function generateDiagramToTitleWithAnthropic(prompt: string) {
  const ai_model = "claude-sonnet-4-20250514"; // or claude-opus-4-20250514
  const chatCompletion = await getAnthropicChatCompletion(prompt, ai_model);

  // Extract text from the response array
  const responseText = chatCompletion;
  console.log(responseText);

  // Print the completion returned by the LLM.
  return responseText;
}

// Groq config
const getGroqChatCompletion = async (prompt: string, ai_model: string) => {
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
        content: instructions,
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

// Example usage:
// const groqResult = await generateDiagramToTitleWithGroq("Your prompt here");
// const anthropicResult = await generateDiagramToTitleWithAnthropic("Your prompt here");