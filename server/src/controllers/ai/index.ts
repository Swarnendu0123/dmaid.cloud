import { GoogleGenAI, Type } from "@google/genai";
import { instructions_text_to_diagram, instructions_diagram_enhancer } from "./instructions";
import Groq from "groq-sdk";
import { ChatMessage, AIGenerator as IAIGenerator, AppError, ErrorCode } from "../../types";
import { parseJSON, buildConversationContext } from "../../utils/helpers";

const dotenv = require("dotenv");

// config
dotenv.config();
const gemini = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AIGenerator {
  enhanceDiagram: () => Promise<string>;

  generateTitle: (prompt: string, ai_model: string) => Promise<string>;

  enhancePrompt: (
    prompt: string,
    old_diagram: string,
    ai_model: string,
    diagramType?: string
  ) => Promise<string>;

  generateDiagram: (
    prompt: string,
    ai_model: string
  ) => Promise<{ title: any; chat: any }>;
}

export class GorqAIGenerator implements IAIGenerator {
  /**
   * Generate a diagram from a prompt
   */
  async generateDiagram(
    prompt: string,
    model: string,
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<{ title: string; chat: string }> {
    try {
      const contextPrompt = conversationHistory
        ? prompt + buildConversationContext(conversationHistory)
        : prompt;

      // Add diagram type specific instruction
      let diagramTypeInstruction = "";
      if (diagramType !== "auto") {
        const diagramTypeMap: Record<string, string> = {
          flowchart: "flowchart",
          sequence: "sequence diagram",
          class: "class diagram",
          state: "state diagram",
          er: "entity relationship diagram",
          gantt: "gantt chart",
          pie: "pie chart",
          journey: "user journey diagram",
          mindmap: "mindmap",
          timeline: "timeline diagram",
          gitgraph: "git graph",
          c4: "C4 diagram",
        };
        const diagramName = diagramTypeMap[diagramType] || diagramType;
        diagramTypeInstruction = `\n\nIMPORTANT: You MUST generate a ${diagramName} specifically.`;
      }

      const response = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: instructions_text_to_diagram + diagramTypeInstruction,
          },
          {
            role: "user",
            content: contextPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "mermaid_diagram",
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                chat: { type: "string" },
              },
              required: ["title", "chat"],
              additionalProperties: false,
            },
          },
        },
      });

      const { title, chat } = parseJSON(
        response.choices[0].message.content || "{}"
      );

      if (!title || !chat) {
        throw new AppError(
          ErrorCode.AI_SERVICE_ERROR,
          "Failed to generate diagram: Invalid response from AI",
          500
        );
      }

      return { title, chat };
    } catch (e: any) {
      console.error("Groq generateDiagram error:", e);
      throw new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        e.message || "Failed to generate diagram",
        500,
        e
      );
    }
  }

  /**
   * Enhance an existing diagram
   */
  async enhanceDiagram(
    diagram: string,
    prompt: string,
    model: string,
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    try {
      const contextPrompt = conversationHistory
        ? prompt + buildConversationContext(conversationHistory)
        : prompt;

      // Add diagram type specific instruction
      let diagramTypeInstruction = "";
      if (diagramType !== "auto") {
        const diagramTypeMap: Record<string, string> = {
          flowchart: "flowchart",
          sequence: "sequence diagram",
          class: "class diagram",
          state: "state diagram",
          er: "entity relationship diagram",
          gantt: "gantt chart",
          pie: "pie chart",
          journey: "user journey diagram",
          mindmap: "mindmap",
          timeline: "timeline diagram",
          gitgraph: "git graph",
          c4: "C4 diagram",
        };
        const diagramName = diagramTypeMap[diagramType] || diagramType;
        diagramTypeInstruction = `\n\nIMPORTANT: Ensure it remains a ${diagramName}.`;
      }

      const response = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: instructions_diagram_enhancer + diagramTypeInstruction,
          },
          {
            role: "user",
            content: `Current diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\nEnhancement request: ${contextPrompt}`,
          },
        ],
      });

      const enhancedDiagram = response.choices[0]?.message?.content || "";

      if (!enhancedDiagram) {
        throw new AppError(
          ErrorCode.AI_SERVICE_ERROR,
          "Failed to enhance diagram: Empty response from AI",
          500
        );
      }

      return enhancedDiagram;
    } catch (e: any) {
      console.error("Groq enhanceDiagram error:", e);
      throw new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        e.message || "Failed to enhance diagram",
        500,
        e
      );
    }
  }

  /**
   * Generate a title for a diagram
   */
  async generateTitle(diagram: string, model: string): Promise<string> {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates concise, descriptive titles for Mermaid diagrams. The title should be 3-8 words and capture the essence of the diagram. Return only the title, nothing else.",
          },
          {
            role: "user",
            content: `Generate a title for this diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\``,
          },
        ],
      });

      const title = response.choices[0]?.message?.content?.trim() || "Untitled Diagram";

      return title;
    } catch (e: any) {
      console.error("Groq generateTitle error:", e);
      throw new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        e.message || "Failed to generate title",
        500,
        e
      );
    }
  }

  /**
   * Enhance a user prompt for better diagram generation
   */
  async enhancePrompt(
    prompt: string,
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    try {
      const contextPrompt = conversationHistory
        ? prompt + buildConversationContext(conversationHistory)
        : prompt;

      const systemPrompt = `You are a helpful assistant that enhances user prompts for Mermaid diagram generation. 
Make the prompt more specific, detailed, and structured while maintaining the user's intent. 
Add relevant technical details, relationships, and structure that would result in a better diagram.
Return only the enhanced prompt, nothing else.`;

      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Enhance this prompt for a ${diagramType === "auto" ? "diagram" : diagramType}: ${contextPrompt}`,
          },
        ],
      });

      const enhancedPrompt =
        response.choices[0]?.message?.content?.trim() || prompt;

      return enhancedPrompt;
    } catch (e: any) {
      console.error("Groq enhancePrompt error:", e);
      // Return original prompt if enhancement fails
      return prompt;
    }
  }
}

export class GoogleAIGenerator implements IAIGenerator {
  /**
   * Generate a diagram from a prompt
   */
  async generateDiagram(
    prompt: string,
    model: string,
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<{ title: string; chat: string }> {
    try {
      const contextPrompt = conversationHistory
        ? prompt + buildConversationContext(conversationHistory)
        : prompt;

      // Add diagram type specific instruction
      let diagramTypeInstruction = "";
      if (diagramType !== "auto") {
        const diagramTypeMap: Record<string, string> = {
          flowchart: "flowchart",
          sequence: "sequence diagram",
          class: "class diagram",
          state: "state diagram",
          er: "entity relationship diagram",
          gantt: "gantt chart",
          pie: "pie chart",
          journey: "user journey diagram",
          mindmap: "mindmap",
          timeline: "timeline diagram",
          gitgraph: "git graph",
          c4: "C4 diagram",
        };
        const diagramName = diagramTypeMap[diagramType] || diagramType;
        diagramTypeInstruction = `\n\nIMPORTANT: You MUST generate a ${diagramName} specifically.`;
      }

      const response = await gemini.models.generateContent({
        model,
        contents: contextPrompt,
        config: {
          systemInstruction: instructions_text_to_diagram + diagramTypeInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            title: Type.STRING,
            chat: Type.STRING,
          },
        },
      });

      const { title, chat } = parseJSON(response.text);

      if (!title || !chat) {
        throw new AppError(
          ErrorCode.AI_SERVICE_ERROR,
          "Failed to generate diagram: Invalid response from AI",
          500
        );
      }

      return { title, chat };
    } catch (e: any) {
      console.error("Gemini generateDiagram error:", e);
      throw new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        e.message || "Failed to generate diagram",
        500,
        e
      );
    }
  }

  /**
   * Enhance an existing diagram
   */
  async enhanceDiagram(
    diagram: string,
    prompt: string,
    model: string,
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    try {
      const contextPrompt = conversationHistory
        ? prompt + buildConversationContext(conversationHistory)
        : prompt;

      // Add diagram type specific instruction
      let diagramTypeInstruction = "";
      if (diagramType !== "auto") {
        const diagramTypeMap: Record<string, string> = {
          flowchart: "flowchart",
          sequence: "sequence diagram",
          class: "class diagram",
          state: "state diagram",
          er: "entity relationship diagram",
          gantt: "gantt chart",
          pie: "pie chart",
          journey: "user journey diagram",
          mindmap: "mindmap",
          timeline: "timeline diagram",
          gitgraph: "git graph",
          c4: "C4 diagram",
        };
        const diagramName = diagramTypeMap[diagramType] || diagramType;
        diagramTypeInstruction = `\n\nIMPORTANT: Ensure it remains a ${diagramName}.`;
      }

      const response = await gemini.models.generateContent({
        model,
        contents: `Current diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\nEnhancement request: ${contextPrompt}`,
        config: {
          systemInstruction: instructions_diagram_enhancer + diagramTypeInstruction,
        },
      });

      const enhancedDiagram = response.text?.trim() || "";

      if (!enhancedDiagram) {
        throw new AppError(
          ErrorCode.AI_SERVICE_ERROR,
          "Failed to enhance diagram: Empty response from AI",
          500
        );
      }

      return enhancedDiagram;
    } catch (e: any) {
      console.error("Gemini enhanceDiagram error:", e);
      throw new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        e.message || "Failed to enhance diagram",
        500,
        e
      );
    }
  }

  /**
   * Generate a title for a diagram
   */
  async generateTitle(diagram: string, model: string): Promise<string> {
    try {
      const response = await gemini.models.generateContent({
        model,
        contents: `Generate a title for this diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\``,
        config: {
          systemInstruction:
            "You are a helpful assistant that generates concise, descriptive titles for Mermaid diagrams. The title should be 3-8 words and capture the essence of the diagram. Return only the title, nothing else.",
        },
      });

      const title = response.text?.trim() || "Untitled Diagram";

      return title;
    } catch (e: any) {
      console.error("Gemini generateTitle error:", e);
      throw new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        e.message || "Failed to generate title",
        500,
        e
      );
    }
  }

  /**
   * Enhance a user prompt for better diagram generation
   */
  async enhancePrompt(
    prompt: string,
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    try {
      const contextPrompt = conversationHistory
        ? prompt + buildConversationContext(conversationHistory)
        : prompt;

      const systemPrompt = `You are a helpful assistant that enhances user prompts for Mermaid diagram generation. 
Make the prompt more specific, detailed, and structured while maintaining the user's intent. 
Add relevant technical details, relationships, and structure that would result in a better diagram.
Return only the enhanced prompt, nothing else.`;

      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Enhance this prompt for a ${diagramType === "auto" ? "diagram" : diagramType}: ${contextPrompt}`,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const enhancedPrompt = response.text?.trim() || prompt;

      return enhancedPrompt;
    } catch (e: any) {
      console.error("Gemini enhancePrompt error:", e);
      // Return original prompt if enhancement fails
      return prompt;
    }
  }
}
