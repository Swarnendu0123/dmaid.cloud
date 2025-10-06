"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAIGenerator = exports.GorqAIGenerator = void 0;
const genai_1 = require("@google/genai");
const instructions_1 = require("./instructions");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const types_1 = require("../../types");
const helpers_1 = require("../../utils/helpers");
const dotenv = require("dotenv");
// config
dotenv.config();
const gemini = new genai_1.GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
class GorqAIGenerator {
    /**
     * Generate a diagram from a prompt
     */
    generateDiagram(prompt_1, model_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, model, diagramType = "auto", conversationHistory) {
            try {
                const contextPrompt = conversationHistory
                    ? prompt + (0, helpers_1.buildConversationContext)(conversationHistory)
                    : prompt;
                // Add diagram type specific instruction
                let diagramTypeInstruction = "";
                if (diagramType !== "auto") {
                    const diagramTypeMap = {
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
                const response = yield groq.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: instructions_1.instructions_text_to_diagram + diagramTypeInstruction,
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
                const { title, chat } = (0, helpers_1.parseJSON)(response.choices[0].message.content || "{}");
                if (!title || !chat) {
                    throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to generate diagram: Invalid response from AI", 500);
                }
                return { title, chat };
            }
            catch (e) {
                console.error("Groq generateDiagram error:", e);
                throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, e.message || "Failed to generate diagram", 500, e);
            }
        });
    }
    /**
     * Enhance an existing diagram
     */
    enhanceDiagram(diagram_1, prompt_1, model_1) {
        return __awaiter(this, arguments, void 0, function* (diagram, prompt, model, diagramType = "auto", conversationHistory) {
            var _a, _b;
            try {
                const contextPrompt = conversationHistory
                    ? prompt + (0, helpers_1.buildConversationContext)(conversationHistory)
                    : prompt;
                // Add diagram type specific instruction
                let diagramTypeInstruction = "";
                if (diagramType !== "auto") {
                    const diagramTypeMap = {
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
                const response = yield groq.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: instructions_1.instructions_diagram_enhancer + diagramTypeInstruction,
                        },
                        {
                            role: "user",
                            content: `Current diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\nEnhancement request: ${contextPrompt}`,
                        },
                    ],
                });
                const enhancedDiagram = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
                if (!enhancedDiagram) {
                    throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to enhance diagram: Empty response from AI", 500);
                }
                return enhancedDiagram;
            }
            catch (e) {
                console.error("Groq enhanceDiagram error:", e);
                throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, e.message || "Failed to enhance diagram", 500, e);
            }
        });
    }
    /**
     * Generate a title for a diagram
     */
    generateTitle(diagram, model) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const response = yield groq.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant that generates concise, descriptive titles for Mermaid diagrams. The title should be 3-8 words and capture the essence of the diagram. Return only the title, nothing else.",
                        },
                        {
                            role: "user",
                            content: `Generate a title for this diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\``,
                        },
                    ],
                });
                const title = ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || "Untitled Diagram";
                return title;
            }
            catch (e) {
                console.error("Groq generateTitle error:", e);
                throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, e.message || "Failed to generate title", 500, e);
            }
        });
    }
    /**
     * Enhance a user prompt for better diagram generation
     */
    enhancePrompt(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, diagramType = "auto", conversationHistory) {
            var _a, _b, _c;
            try {
                const contextPrompt = conversationHistory
                    ? prompt + (0, helpers_1.buildConversationContext)(conversationHistory)
                    : prompt;
                const systemPrompt = `You are a helpful assistant that enhances user prompts for Mermaid diagram generation. 
Make the prompt more specific, detailed, and structured while maintaining the user's intent. 
Add relevant technical details, relationships, and structure that would result in a better diagram.
Return only the enhanced prompt, nothing else.`;
                const response = yield groq.chat.completions.create({
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
                const enhancedPrompt = ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || prompt;
                return enhancedPrompt;
            }
            catch (e) {
                console.error("Groq enhancePrompt error:", e);
                // Return original prompt if enhancement fails
                return prompt;
            }
        });
    }
}
exports.GorqAIGenerator = GorqAIGenerator;
class GoogleAIGenerator {
    /**
     * Generate a diagram from a prompt
     */
    generateDiagram(prompt_1, model_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, model, diagramType = "auto", conversationHistory) {
            try {
                const contextPrompt = conversationHistory
                    ? prompt + (0, helpers_1.buildConversationContext)(conversationHistory)
                    : prompt;
                // Add diagram type specific instruction
                let diagramTypeInstruction = "";
                if (diagramType !== "auto") {
                    const diagramTypeMap = {
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
                const response = yield gemini.models.generateContent({
                    model,
                    contents: contextPrompt,
                    config: {
                        systemInstruction: instructions_1.instructions_text_to_diagram + diagramTypeInstruction,
                        responseMimeType: "application/json",
                        responseSchema: {
                            title: genai_1.Type.STRING,
                            chat: genai_1.Type.STRING,
                        },
                    },
                });
                const { title, chat } = (0, helpers_1.parseJSON)(response.text);
                if (!title || !chat) {
                    throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to generate diagram: Invalid response from AI", 500);
                }
                return { title, chat };
            }
            catch (e) {
                console.error("Gemini generateDiagram error:", e);
                throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, e.message || "Failed to generate diagram", 500, e);
            }
        });
    }
    /**
     * Enhance an existing diagram
     */
    enhanceDiagram(diagram_1, prompt_1, model_1) {
        return __awaiter(this, arguments, void 0, function* (diagram, prompt, model, diagramType = "auto", conversationHistory) {
            var _a;
            try {
                const contextPrompt = conversationHistory
                    ? prompt + (0, helpers_1.buildConversationContext)(conversationHistory)
                    : prompt;
                // Add diagram type specific instruction
                let diagramTypeInstruction = "";
                if (diagramType !== "auto") {
                    const diagramTypeMap = {
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
                const response = yield gemini.models.generateContent({
                    model,
                    contents: `Current diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\nEnhancement request: ${contextPrompt}`,
                    config: {
                        systemInstruction: instructions_1.instructions_diagram_enhancer + diagramTypeInstruction,
                    },
                });
                const enhancedDiagram = ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                if (!enhancedDiagram) {
                    throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to enhance diagram: Empty response from AI", 500);
                }
                return enhancedDiagram;
            }
            catch (e) {
                console.error("Gemini enhanceDiagram error:", e);
                throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, e.message || "Failed to enhance diagram", 500, e);
            }
        });
    }
    /**
     * Generate a title for a diagram
     */
    generateTitle(diagram, model) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield gemini.models.generateContent({
                    model,
                    contents: `Generate a title for this diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\``,
                    config: {
                        systemInstruction: "You are a helpful assistant that generates concise, descriptive titles for Mermaid diagrams. The title should be 3-8 words and capture the essence of the diagram. Return only the title, nothing else.",
                    },
                });
                const title = ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "Untitled Diagram";
                return title;
            }
            catch (e) {
                console.error("Gemini generateTitle error:", e);
                throw new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, e.message || "Failed to generate title", 500, e);
            }
        });
    }
    /**
     * Enhance a user prompt for better diagram generation
     */
    enhancePrompt(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, diagramType = "auto", conversationHistory) {
            var _a;
            try {
                const contextPrompt = conversationHistory
                    ? prompt + (0, helpers_1.buildConversationContext)(conversationHistory)
                    : prompt;
                const systemPrompt = `You are a helpful assistant that enhances user prompts for Mermaid diagram generation. 
Make the prompt more specific, detailed, and structured while maintaining the user's intent. 
Add relevant technical details, relationships, and structure that would result in a better diagram.
Return only the enhanced prompt, nothing else.`;
                const response = yield gemini.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `Enhance this prompt for a ${diagramType === "auto" ? "diagram" : diagramType}: ${contextPrompt}`,
                    config: {
                        systemInstruction: systemPrompt,
                    },
                });
                const enhancedPrompt = ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || prompt;
                return enhancedPrompt;
            }
            catch (e) {
                console.error("Gemini enhancePrompt error:", e);
                // Return original prompt if enhancement fails
                return prompt;
            }
        });
    }
}
exports.GoogleAIGenerator = GoogleAIGenerator;
//# sourceMappingURL=index.js.map