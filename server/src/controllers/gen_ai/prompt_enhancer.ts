// src/promptEnhancer.js
// Unified prompt enhancement & multi-LLM helpers:
//  - Google Gemini (google/generative-ai SDK assumed)
//  - Groq (groq-sdk if installed, otherwise fetch fallback)
//  - Anthropic/Claude (SDK or fetch fallback)
// Exports:
//   generateTextTotitleWithGemini(prompt)
//   enhancePromptWithGroq(prompt, diagramType = 'auto')
//   generateTextWithClaude(prompt, model = 'claude-2.1')
//   generateTextWithClaudeFetch(prompt, model = 'claude-2.1')

import dotenv from "dotenv";
dotenv.config();

let GoogleGenerativeAI;
try {
  // lazy import so module doesn't crash if user doesn't have package installed
  GoogleGenerativeAI = (await import("@google/generative-ai")).GoogleGenerativeAI;
} catch (e) {
  // not fatal; we'll throw at runtime if used without the package
  GoogleGenerativeAI = null;
}

// Try to import Groq SDK (if installed). If not, we'll use fetch fallback.
let GroqSDK = null;
try {
  GroqSDK = (await import("groq-sdk")).default || (await import("groq-sdk"));
} catch (e) {
  GroqSDK = null;
}

/**
 * Helper: ensure required env vars exist.
 * @param {string[]} keys
 */
function ensureEnv(keys = []) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

/**
 * ----- Gemini (Google Generative AI) -----
 * generateTextTotitleWithGemini(prompt: string)
 */
export async function generateTextTotitleWithGemini(prompt) {
  ensureEnv(["GOOGLE_GEMINI_API_KEY"]);
  if (!GoogleGenerativeAI) {
    throw new Error(
      "Google Generative AI SDK not available. Install @google/generative-ai or use another function."
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // If you have an instructions prompt module, you can import/compose it instead.
  // Here we allow prompt to be either a string or an array of messages.
  const messages = [
    // e.g. system instruction (optional)
    {
      role: "system",
      content:
        "You are a helpful assistant. Enhance the user's prompt for diagram generation and include formatting hints."
    },
    { role: "user", content: String(prompt) }
  ];

  try {
    const result = await model.generateContent(messages);
    // SDKs differ — try multiple getters:
    if (typeof result.response?.text === "function") {
      return result.response.text();
    }
    if (result.response?.text) {
      return result.response.text;
    }
    // fallback: print raw object
    return JSON.stringify(result);
  } catch (err) {
    console.error("Gemini error:", err);
    throw err;
  }
}

/**
 * ----- Groq (prompt enhancer) -----
 * enhancePromptWithGroq(prompt: string, diagramType: string = "auto")
 *
 * Two modes:
 *  - If groq-sdk is installed, use its chat completions
 *  - Otherwise fallback to HTTP fetch to Groq API endpoint
 */
export async function enhancePromptWithGroq(prompt, diagramType = "auto") {
  ensureEnv(["GROQ_API_KEY"]);
  const ai_model = "meta-llama/llama-4-scout-17b-16e-instruct";

  const diagramInstruction =
    diagramType && diagramType !== "auto"
      ? `\n\nIMPORTANT: The user specifically requested a ${diagramType} diagram. Generate a prompt tailored for that type.`
      : "";

  const systemInstruction =
    "You are a prompt enhancer that rewrites, clarifies, expands and produces final prompts optimized for diagram generation." +
    diagramInstruction;

  // prefer SDK if available
  if (GroqSDK) {
    try {
      const groq = new GroqSDK({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: ai_model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: String(prompt) }
        ],
        temperature: 0.3,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false
      });

      // Normalize common response shapes:
      if (response.choices && response.choices.length) {
        const choice = response.choices[0];
        if (choice.message && (choice.message.content || choice.message.text)) {
          return choice.message.content || choice.message.text || "";
        }
        if (choice.delta) {
          // incremental
          return (choice.delta.content || choice.delta.text || "").toString();
        }
      }
      if (response.output_text) return response.output_text;
      return JSON.stringify(response);
    } catch (err) {
      console.error("Groq SDK error:", err);
      // fall through to fetch fallback
    }
  }

  // Fetch fallback (HTTP). Endpoint may change depending on Groq product; check your account docs.
  try {
    const endpoint = "https://api.groq.dev/v1/chat/completions"; // adjust if your account uses different base
    const body = {
      model: ai_model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: String(prompt) }
      ],
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 1
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Groq fetch error ${resp.status}: ${txt}`);
    }
    const data = await resp.json();
    // Common shape: data.choices[0].message.content
    if (data.choices && data.choices.length) {
      return data.choices[0].message?.content || data.choices[0].text || JSON.stringify(data.choices[0]);
    }
    if (data.output_text) return data.output_text;
    return JSON.stringify(data);
  } catch (err) {
    console.error("Groq fetch error:", err);
    throw err;
  }
}

/**
 * ----- Anthropic (Claude) via SDK -----
 */
let AnthropicSDK = null;
try {
  AnthropicSDK = (await import("@anthropic-ai/sdk")).default || (await import("@anthropic-ai/sdk"));
} catch (e) {
  AnthropicSDK = null;
}

export async function generateTextWithClaude(prompt, model = "claude-2.1") {
  ensureEnv(["CLAUDE_API_KEY"]);
  if (!AnthropicSDK) {
    throw new Error("Anthropic SDK not installed. Use generateTextWithClaudeFetch instead or install @anthropic-ai/sdk");
  }
  try {
    const anthropic = new AnthropicSDK({ apiKey: process.env.CLAUDE_API_KEY });
    // responses API shape may vary by SDK version; attempt common pattern:
    const res = await anthropic.responses.create({
      model,
      input: prompt,
      max_tokens: 1024,
      temperature: 0.5
    });

    // Try to normalize response
    if (res.output_text) return res.output_text;
    if (res.output && Array.isArray(res.output)) {
      const pieces = res.output
        .map((o) => {
          if (!o) return "";
          if (o.content) {
            if (Array.isArray(o.content)) return o.content.map((c) => c.text || "").join("");
            if (typeof o.content === "string") return o.content;
            if (o.content.text) return o.content.text;
          }
          return "";
        })
        .join("\n")
        .trim();
      if (pieces) return pieces;
    }
    return JSON.stringify(res);
  } catch (err) {
    console.error("Anthropic SDK error:", err);
    throw err;
  }
}

/**
 * Anthropic / Claude via fetch (fallback)
 */
export async function generateTextWithClaudeFetch(prompt, model = "claude-2.1") {
  ensureEnv(["CLAUDE_API_KEY"]);
  const key = process.env.CLAUDE_API_KEY;
  // endpoint might be /v1/complete or /v1/responses depending on your Anthropic API version:
  const endpoint = "https://api.anthropic.com/v1/complete"; // adjust if needed
  const body = {
    model,
    prompt,
    max_tokens_to_sample: 1024,
    temperature: 0.5
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key // some Anthropic integrations use x-api-key
      // Or: Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Claude fetch error ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  return data.completion || data.output_text || JSON.stringify(data);
}
