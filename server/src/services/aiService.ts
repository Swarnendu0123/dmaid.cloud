import { GorqAIGenerator, GoogleAIGenerator } from "../controllers/ai";
import { ChatMessage, AppError, ErrorCode } from "../types";
import { sanitizePrompt } from "../utils/helpers";

export class AIService {
  private groqGenerator: GorqAIGenerator;
  private googleGenerator: GoogleAIGenerator;

  constructor() {
    this.groqGenerator = new GorqAIGenerator();
    this.googleGenerator = new GoogleAIGenerator();
  }

  /**
   * Get the appropriate AI generator based on the model
   */
  private getGenerator(model: string) {
    if (model.includes("gemini")) {
      return this.googleGenerator;
    }
    return this.groqGenerator;
  }

  /**
   * Generate a diagram from a prompt
   */
  async generateDiagram(
    prompt: string,
    model: string = "meta-llama/llama-4-scout-17b-16e-instruct",
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<{ title: string; diagram: string }> {
    try {
      const sanitizedPrompt = sanitizePrompt(prompt);
      const generator = this.getGenerator(model);

      // Enhance prompt first
      const enhancedPrompt = await generator.enhancePrompt(
        sanitizedPrompt,
        diagramType,
        conversationHistory
      );

      console.log("Enhanced prompt:", enhancedPrompt);

      // Generate diagram
      const { title, chat } = await generator.generateDiagram(
        enhancedPrompt,
        model,
        diagramType,
        conversationHistory
      );

      return { title, diagram: chat };
    } catch (error: any) {
      console.error("AIService generateDiagram error:", error);
      throw error instanceof AppError
        ? error
        : new AppError(
            ErrorCode.AI_SERVICE_ERROR,
            "Failed to generate diagram",
            500,
            error
          );
    }
  }

  /**
   * Generate a title for a diagram
   */
  async generateTitle(
    diagram: string,
    model: string = "meta-llama/llama-4-scout-17b-16e-instruct"
  ): Promise<string> {
    try {
      const generator = this.getGenerator(model);
      const title = await generator.generateTitle(diagram, model);
      return title;
    } catch (error: any) {
      console.error("AIService generateTitle error:", error);
      throw error instanceof AppError
        ? error
        : new AppError(
            ErrorCode.AI_SERVICE_ERROR,
            "Failed to generate title",
            500,
            error
          );
    }
  }

  /**
   * Enhance an existing diagram
   */
  async enhanceDiagram(
    diagram: string,
    prompt: string,
    model: string = "meta-llama/llama-4-scout-17b-16e-instruct",
    diagramType: string = "auto",
    conversationHistory?: ChatMessage[]
  ): Promise<{ title: string; diagram: string }> {
    try {
      const sanitizedPrompt = sanitizePrompt(prompt);
      const generator = this.getGenerator(model);

      // Enhance the diagram with the provided prompt
      const enhancedDiagram = await generator.enhanceDiagram(
        diagram,
        sanitizedPrompt,
        model,
        diagramType,
        conversationHistory
      );

      // Generate a title for the enhanced diagram
      const title = await generator.generateTitle(enhancedDiagram, model);

      return { title, diagram: enhancedDiagram };
    } catch (error: any) {
      console.error("AIService enhanceDiagram error:", error);
      throw error instanceof AppError
        ? error
        : new AppError(
            ErrorCode.AI_SERVICE_ERROR,
            "Failed to enhance diagram",
            500,
            error
          );
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
