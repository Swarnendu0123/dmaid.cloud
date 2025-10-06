"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGenerateTitle = exports.validateEnhanceDiagram = exports.validateGenerateDiagram = void 0;
const types_1 = require("../types");
const validateGenerateDiagram = (req, res, next) => {
    const { prompt, model, diagramType } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Prompt is required and must be a non-empty string", 400);
    }
    if (prompt.length > 5000) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Prompt must be less than 5000 characters", 400);
    }
    if (model && typeof model !== "string") {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Model must be a string", 400);
    }
    if (diagramType && typeof diagramType !== "string") {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "DiagramType must be a string", 400);
    }
    next();
};
exports.validateGenerateDiagram = validateGenerateDiagram;
const validateEnhanceDiagram = (req, res, next) => {
    const { diagram, prompt, model, diagramType } = req.body;
    if (!diagram || typeof diagram !== "string" || diagram.trim().length === 0) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Diagram is required and must be a non-empty string", 400);
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Prompt is required and must be a non-empty string", 400);
    }
    if (diagram.length > 50000) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Diagram must be less than 50000 characters", 400);
    }
    if (prompt.length > 5000) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Prompt must be less than 5000 characters", 400);
    }
    if (model && typeof model !== "string") {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Model must be a string", 400);
    }
    if (diagramType && typeof diagramType !== "string") {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "DiagramType must be a string", 400);
    }
    next();
};
exports.validateEnhanceDiagram = validateEnhanceDiagram;
const validateGenerateTitle = (req, res, next) => {
    const { diagram, model } = req.body;
    if (!diagram || typeof diagram !== "string" || diagram.trim().length === 0) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Diagram is required and must be a non-empty string", 400);
    }
    if (diagram.length > 50000) {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Diagram must be less than 50000 characters", 400);
    }
    if (model && typeof model !== "string") {
        throw new types_1.AppError(types_1.ErrorCode.VALIDATION_ERROR, "Model must be a string", 400);
    }
    next();
};
exports.validateGenerateTitle = validateGenerateTitle;
//# sourceMappingURL=validation.js.map