// Message types for conversation history
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// Request/Response types
export interface GenerateDiagramRequest {
  prompt: string;
  model?: string;
  diagramType?: string;
  conversationHistory?: ChatMessage[];
}

export interface EnhanceDiagramRequest {
  diagram: string;
  prompt: string;
  model?: string;
  diagramType?: string;
  conversationHistory?: ChatMessage[];
}

export interface GenerateTitleRequest {
  diagram: string;
  model?: string;
}

export interface DiagramResponse {
  success: boolean;
  data?: {
    diagram: string;
    title?: string;
    message?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface TitleResponse {
  success: boolean;
  data?: {
    title: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// AI Generator interface
export interface AIGenerator {
  generateDiagram(
    prompt: string,
    model: string,
    diagramType?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<{ title: string; chat: string }>;

  enhanceDiagram(
    diagram: string,
    prompt: string,
    model: string,
    diagramType?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string>;

  generateTitle(diagram: string, model: string): Promise<string>;

  enhancePrompt(
    prompt: string,
    diagramType?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string>;
}

// Error types
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}
