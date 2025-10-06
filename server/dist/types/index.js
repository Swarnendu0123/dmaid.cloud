"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ErrorCode = void 0;
// Error types
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["AI_SERVICE_ERROR"] = "AI_SERVICE_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    ErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class AppError extends Error {
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
//# sourceMappingURL=index.js.map