import Groq from "groq-sdk";

const dotenv = require("dotenv");
import { instructions_diagram_enhancer as instructions } from "./instructions";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Gorq gen AI model
export async function diagramEnhancer(prompt: string, old_diagram: string, ai_model:string) {
  try {
    const chatCompletion = await getGroqChatCompletion(prompt, old_diagram, ai_model);

    console.log(ai_model);
    
    console.log(chatCompletion.choices[0]?.message?.content);

    // Print the completion returned by the LLM.
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (e) {
    console.log(e.message);

    return "Error in generating response";
  }
}

// grok config
const getGroqChatCompletion = async (prompt: string, old_diagram: string, ai_model: string) => {
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
        content: "### Prompt: \n\n" + prompt + "#### Input:" + old_diagram,
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
