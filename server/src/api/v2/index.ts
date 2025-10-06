import { Router, Request, Response } from "express";
import { AIService } from "../../services/aiService";
import {
  validateGenerateDiagram,
  validateEnhanceDiagram,
  validateGenerateTitle,
} from "../../middleware/validation";
import { asyncHandler } from "../../middleware/errorHandler";
import { formatSuccessResponse } from "../../utils/helpers";
import {
  GenerateDiagramRequest,
  EnhanceDiagramRequest,
  GenerateTitleRequest,
} from "../../types";

const router = Router();
const aiService = new AIService();

/**
 * @route   GET /api/v2
 * @desc    Get API information
 * @access  Public
 */
router.get("/", (req: Request, res: Response) => {
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
        "POST /api/v2/diagram/generate":
          "Generate a new diagram from a prompt with optional conversation history",
        "POST /api/v2/diagram/enhance":
          "Enhance an existing diagram with optional conversation history",
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
router.get("/health", (req: Request, res: Response) => {
  res.json(
    formatSuccessResponse(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "API is running"
    )
  );
});

/**
 * @route   POST /api/v2/diagram/generate
 * @desc    Generate a diagram from a prompt
 * @access  Public
 * @body    { prompt: string, model?: string, diagramType?: string, conversationHistory?: ChatMessage[] }
 */
router.post(
  "/diagram/generate",
  validateGenerateDiagram,
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, model, diagramType, conversationHistory } =
      req.body as GenerateDiagramRequest;

    console.log("\n📝 Generating diagram...");
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`Model: ${model || "default"}`);
    console.log(`Diagram Type: ${diagramType || "auto"}`);

    const result = await aiService.generateDiagram(
      prompt,
      model,
      diagramType,
      conversationHistory
    );

    console.log("✅ Diagram generated successfully");
    console.log(`Title: ${result.title}\n`);

    res.json(
      formatSuccessResponse(
        {
          diagram: result.diagram,
          title: result.title,
        },
        "Diagram generated successfully"
      )
    );
  })
);

/**
 * @route   POST /api/v2/diagram/enhance
 * @desc    Enhance an existing diagram
 * @access  Public
 * @body    { diagram: string, prompt: string, model?: string, diagramType?: string, conversationHistory?: ChatMessage[] }
 */
router.post(
  "/diagram/enhance",
  validateEnhanceDiagram,
  asyncHandler(async (req: Request, res: Response) => {
    const { diagram, prompt, model, diagramType, conversationHistory } =
      req.body as EnhanceDiagramRequest;

    console.log("\n🔧 Enhancing diagram...");
    console.log(`Enhancement request: ${prompt.substring(0, 100)}...`);
    console.log(`Model: ${model || "default"}`);

    const result = await aiService.enhanceDiagram(
      diagram,
      prompt,
      model,
      diagramType,
      conversationHistory
    );

    console.log("✅ Diagram enhanced successfully");
    console.log(`Title: ${result.title}\n`);

    res.json(
      formatSuccessResponse(
        {
          diagram: result.diagram,
          title: result.title,
        },
        "Diagram enhanced successfully"
      )
    );
  })
);

/**
 * @route   POST /api/v2/diagram/title
 * @desc    Generate a title for a diagram
 * @access  Public
 * @body    { diagram: string, model?: string }
 */
router.post(
  "/diagram/title",
  validateGenerateTitle,
  asyncHandler(async (req: Request, res: Response) => {
    const { diagram, model } = req.body as GenerateTitleRequest;

    console.log("\n📋 Generating title...");
    console.log(`Diagram length: ${diagram.length} characters`);

    const title = await aiService.generateTitle(diagram, model);

    console.log(`✅ Title generated: ${title}\n`);

    res.json(
      formatSuccessResponse(
        {
          title,
        },
        "Title generated successfully"
      )
    );
  })
);

export default router;
