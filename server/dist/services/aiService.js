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
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const ai_1 = require("../controllers/ai");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
class AIService {
    constructor() {
        this.groqGenerator = new ai_1.GorqAIGenerator();
        this.googleGenerator = new ai_1.GoogleAIGenerator();
    }
    /**
     * Get the appropriate AI generator based on the model
     */
    getGenerator(model) {
        if (model.includes("gemini")) {
            return this.googleGenerator;
        }
        return this.groqGenerator;
    }
    /**
     * Generate a diagram from a prompt
     */
    generateDiagram(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, model = "meta-llama/llama-4-scout-17b-16e-instruct", diagramType = "auto", conversationHistory) {
            try {
                const sanitizedPrompt = (0, helpers_1.sanitizePrompt)(prompt);
                const generator = this.getGenerator(model);
                // Enhance prompt first
                const enhancedPrompt = yield generator.enhancePrompt(sanitizedPrompt, diagramType, conversationHistory);
                console.log("Enhanced prompt:", enhancedPrompt);
                // Generate diagram
                const { title, chat } = yield generator.generateDiagram(enhancedPrompt, model, diagramType, conversationHistory);
                return { title, diagram: chat };
            }
            catch (error) {
                console.error("AIService generateDiagram error:", error);
                throw error instanceof types_1.AppError
                    ? error
                    : new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to generate diagram", 500, error);
            }
        });
    }
    /**
     * Generate a title for a diagram
     */
    generateTitle(diagram_1) {
        return __awaiter(this, arguments, void 0, function* (diagram, model = "meta-llama/llama-4-scout-17b-16e-instruct") {
            try {
                const generator = this.getGenerator(model);
                const title = yield generator.generateTitle(diagram, model);
                return title;
            }
            catch (error) {
                console.error("AIService generateTitle error:", error);
                throw error instanceof types_1.AppError
                    ? error
                    : new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to generate title", 500, error);
            }
        });
    }
    /**
     * Enhance an existing diagram
     */
    enhanceDiagram(diagram_1, prompt_1) {
        return __awaiter(this, arguments, void 0, function* (diagram, prompt, model = "meta-llama/llama-4-scout-17b-16e-instruct", diagramType = "auto", conversationHistory) {
            try {
                const sanitizedPrompt = (0, helpers_1.sanitizePrompt)(prompt);
                const generator = this.getGenerator(model);
                // Enhance the diagram with the provided prompt
                const enhancedDiagram = yield generator.enhanceDiagram(diagram, sanitizedPrompt, model, diagramType, conversationHistory);
                // Generate a title for the enhanced diagram
                const title = yield generator.generateTitle(enhancedDiagram, model);
                return { title, diagram: enhancedDiagram };
            }
            catch (error) {
                console.error("AIService enhanceDiagram error:", error);
                throw error instanceof types_1.AppError
                    ? error
                    : new types_1.AppError(types_1.ErrorCode.AI_SERVICE_ERROR, "Failed to enhance diagram", 500, error);
            }
        });
    }
}
exports.AIService = AIService;
// Export singleton instance
exports.aiService = new AIService();
//# sourceMappingURL=aiService.js.map