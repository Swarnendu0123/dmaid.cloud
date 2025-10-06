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
const express_1 = require("express");
const aiService_1 = require("../../services/aiService");
const validation_1 = require("../../middleware/validation");
const errorHandler_1 = require("../../middleware/errorHandler");
const helpers_1 = require("../../utils/helpers");
const router = (0, express_1.Router)();
const aiService = new aiService_1.AIService();
/**
 * @route   GET /api/v2
 * @desc    Get API information
 * @access  Public
 */
router.get("/", (req, res) => {
    res.json({
        success: true,
        data: {
            version: "v2",
            name: "Dmaid.cloud API",
            description: "Professional Mermaid diagram generation platform",
            features: [
                "AI-powered diagram generation",
                "Diagram enhancement with context",
                "Automatic title generation",
                "Conversation history support",
                "Multiple AI providers (Groq, Google Gemini)",
                "Type-safe error handling",
            ],
            routes: {
                "POST /api/v2/diagram/generate": "Generate a new diagram from a prompt with optional conversation history",
                "POST /api/v2/diagram/enhance": "Enhance an existing diagram with optional conversation history",
                "POST /api/v2/diagram/title": "Generate a title for a diagram",
                "GET /api/v2/health": "Check API health status",
            },
            documentation: "See API_V2_DOCUMENTATION.md for detailed usage",
        },
    });
});
/**
 * @route   GET /api/v2/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/health", (req, res) => {
    res.json((0, helpers_1.formatSuccessResponse)({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }, "API is running"));
});
/**
 * @route   POST /api/v2/diagram/generate
 * @desc    Generate a diagram from a prompt
 * @access  Public
 * @body    { prompt: string, model?: string, diagramType?: string, conversationHistory?: ChatMessage[] }
 */
router.post("/diagram/generate", validation_1.validateGenerateDiagram, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt, model, diagramType, conversationHistory } = req.body;
    console.log("\n📝 Generating diagram...");
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`Model: ${model || "default"}`);
    console.log(`Diagram Type: ${diagramType || "auto"}`);
    const result = yield aiService.generateDiagram(prompt, model, diagramType, conversationHistory);
    console.log("✅ Diagram generated successfully");
    console.log(`Title: ${result.title}\n`);
    res.json((0, helpers_1.formatSuccessResponse)({
        diagram: result.diagram,
        title: result.title,
    }, "Diagram generated successfully"));
})));
/**
 * @route   POST /api/v2/diagram/enhance
 * @desc    Enhance an existing diagram
 * @access  Public
 * @body    { diagram: string, prompt: string, model?: string, diagramType?: string, conversationHistory?: ChatMessage[] }
 */
router.post("/diagram/enhance", validation_1.validateEnhanceDiagram, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { diagram, prompt, model, diagramType, conversationHistory } = req.body;
    console.log("\n🔧 Enhancing diagram...");
    console.log(`Enhancement request: ${prompt.substring(0, 100)}...`);
    console.log(`Model: ${model || "default"}`);
    const result = yield aiService.enhanceDiagram(diagram, prompt, model, diagramType, conversationHistory);
    console.log("✅ Diagram enhanced successfully");
    console.log(`Title: ${result.title}\n`);
    res.json((0, helpers_1.formatSuccessResponse)({
        diagram: result.diagram,
        title: result.title,
    }, "Diagram enhanced successfully"));
})));
/**
 * @route   POST /api/v2/diagram/title
 * @desc    Generate a title for a diagram
 * @access  Public
 * @body    { diagram: string, model?: string }
 */
router.post("/diagram/title", validation_1.validateGenerateTitle, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { diagram, model } = req.body;
    console.log("\n📋 Generating title...");
    console.log(`Diagram length: ${diagram.length} characters`);
    const title = yield aiService.generateTitle(diagram, model);
    console.log(`✅ Title generated: ${title}\n`);
    res.json((0, helpers_1.formatSuccessResponse)({
        title,
    }, "Title generated successfully"));
})));
exports.default = router;
//# sourceMappingURL=index.js.map