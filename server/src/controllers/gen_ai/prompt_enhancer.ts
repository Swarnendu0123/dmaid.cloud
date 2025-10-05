// add these near the top of your existing file
import { GoogleGenerativeAI } from "@google/generative-ai";
const dotenv = require("dotenv");
import Groq from "groq-sdk";
import { instructions_prompt_enhancer as instructions } from "./instructions";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// existing Gemini function
export async function generateTextTotitleWithGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([instructions, prompt]);
  return result.response.text();
}

// existing Groq function
export async function enhancePromptWithGroq(prompt: any, diagramType: string = "auto") {
  const ai_model = "meta-llama/llama-4-scout-17b-16e-instruct";
  const chatCompletion = await getGroqChatCompletion(prompt, ai_model, diagramType);
  return chatCompletion.choices[0]?.message?.content || "";
}

const getGroqChatCompletion = async (prompt: string, ai_model: string, diagramType: string = "auto") => {
  let diagramTypeInstruction = "";
  if (diagramType !== "auto") {
    diagramTypeInstruction = `\n\nIMPORTANT: The user has specifically requested a ${diagramType} diagram. Please enhance the prompt to generate a ${diagramType} diagram type specifically.`;
  }
  return groq.chat.completions.create({
    messages: [
      { role: "system", content: instructions + diagramTypeInstruction },
      { role: "user", content: prompt },
    ],
    model: ai_model,
    temperature: 0.5,
    max_completion_tokens: 1024,
    top_p: 1,
    stop: null,
    stream: false,
  });
};

////////////////////////////////////////////////////////////////////////////////
// === Anthropic / Claude integration (two options) ===
// Option A: Using the official SDK (recommended)
////////////////////////////////////////////////////////////////////////////////

/*
  npm i @anthropic-ai/sdk
  Set CLAUDE_API_KEY in your env (.env)
*/
import Anthropic from "@anthropic-ai/sdk"; // ensure tsconfig allows synthetic default imports or use require()
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

/**
 * Use Claude via the Anthropic SDK. Model name may differ depending on your account:
 * e.g. "claude-2.1", "claude-3.0", "claude-instant" etc. Adjust to your subscription.
 */
export async function generateTextWithClaude(prompt: string, model = "claude-2.1"): Promise<string> {
  try {
    // The SDK has evolved — some versions expose `responses.create`. The following
    // uses the Responses API form which returns `output_text` on many SDK versions.
    const res: any = await anthropic.responses.create({
      model,
      input: prompt,
      // optional parameters:
      max_tokens: 1024,      // or max_output_tokens depending on SDK version
      temperature: 0.5,
    });

    // Different SDK versions return results differently. Try common fields:
    if (res.output_text) return res.output_text;
    if (res.output?.length) {
      // concatenate textual content if present
      const pieces = res.output.map((o: any) => {
        if (o.content) {
          // content may be an array of {type:'output_text', text: '...'}
          if (Array.isArray(o.content)) {
            return o.content.map((c: any) => c.text || "").join("");
          }
          return o.content.text || "";
        }
        return "";
      });
      const joined = pieces.join("\n").trim();
      if (joined) return joined;
    }

    // Fallback to raw JSON string (shouldn't normally be needed)
    return JSON.stringify(res);
  } catch (err) {
    console.error("Claude SDK error:", err);
    throw err;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Option B: Fetch-based call (fallback)
// Note: endpoints, headers, and body fields have changed historically. If you
// prefer fetch, validate with the current Anthropic docs or use the official SDK.
// npm install @anthropic-ai/sdk
//or
//yarn add @anthropic-ai/sdk
////////////////////////////////////////////////////////////////////////////////

export async function generateTextWithClaudeFetch(prompt: string, model = "claude-2.1"): Promise<string> {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) throw new Error("Missing CLAUDE_API_KEY env var");

  // Example: older Anthropic `complete` endpoint. If your account uses Responses API,
  // update the URL and payload accordingly.
  const endpoint = "https://api.anthropic.com/v1/complete"; // or '/v1/responses'
  const body = {
    model,
    prompt: prompt,
    max_tokens_to_sample: 1024,
    temperature: 0.5,
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Anthropic sometimes expects x-api-key or Authorization: Bearer, check your account.
      "x-api-key": key,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Claude fetch error ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  // common fields: data.completion or data.output_text (depends on endpoint/version)
  return data.completion || data.output_text || JSON.stringify(data);
}
