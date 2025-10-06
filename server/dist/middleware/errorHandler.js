"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const types_1 = require("../types");
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    if (err instanceof types_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
    }
    // Handle unknown errors
    return res.status(500).json({
        success: false,
        error: {
            code: types_1.ErrorCode.INTERNAL_ERROR,
            message: "An unexpected error occurred",
            details: process.env.NODE_ENV === "development" ? err.message : undefined,
        },
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map