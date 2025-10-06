"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConversationContext = exports.sanitizePrompt = exports.parseJSON = exports.formatErrorResponse = exports.formatSuccessResponse = void 0;
const formatSuccessResponse = (data, message) => {
    return {
        success: true,
        data,
        message,
    };
};
exports.formatSuccessResponse = formatSuccessResponse;
const formatErrorResponse = (code, message, details) => {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
};
exports.formatErrorResponse = formatErrorResponse;
const parseJSON = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        console.error("JSON parsing error:", e);
        return null;
    }
};
exports.parseJSON = parseJSON;
const sanitizePrompt = (prompt) => {
    return prompt.trim().replace(/\s+/g, " ");
};
exports.sanitizePrompt = sanitizePrompt;
const buildConversationContext = (conversationHistory) => {
    if (!conversationHistory || conversationHistory.length === 0) {
        return "";
    }
    const context = conversationHistory
        .map((msg) => {
        const role = msg.role === "user" ? "User" : "Assistant";
        return `${role}: ${msg.content}`;
    })
        .join("\n\n");
    return `\n\nPrevious conversation:\n${context}\n\n`;
};
exports.buildConversationContext = buildConversationContext;
//# sourceMappingURL=helpers.js.map