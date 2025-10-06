import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCode } from "../types";

export const validateGenerateDiagram = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { prompt, model, diagramType } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Prompt is required and must be a non-empty string",
      400
    );
  }

  if (prompt.length > 5000) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Prompt must be less than 5000 characters",
      400
    );
  }

  if (model && typeof model !== "string") {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Model must be a string",
      400
    );
  }

  if (diagramType && typeof diagramType !== "string") {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "DiagramType must be a string",
      400
    );
  }

  next();
};

export const validateEnhanceDiagram = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { diagram, prompt, model, diagramType } = req.body;

  if (!diagram || typeof diagram !== "string" || diagram.trim().length === 0) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Diagram is required and must be a non-empty string",
      400
    );
  }

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Prompt is required and must be a non-empty string",
      400
    );
  }

  if (diagram.length > 50000) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Diagram must be less than 50000 characters",
      400
    );
  }

  if (prompt.length > 5000) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Prompt must be less than 5000 characters",
      400
    );
  }

  if (model && typeof model !== "string") {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Model must be a string",
      400
    );
  }

  if (diagramType && typeof diagramType !== "string") {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "DiagramType must be a string",
      400
    );
  }

  next();
};

export const validateGenerateTitle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { diagram, model } = req.body;

  if (!diagram || typeof diagram !== "string" || diagram.trim().length === 0) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Diagram is required and must be a non-empty string",
      400
    );
  }

  if (diagram.length > 50000) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Diagram must be less than 50000 characters",
      400
    );
  }

  if (model && typeof model !== "string") {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Model must be a string",
      400
    );
  }

  next();
};
