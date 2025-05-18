"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.EventModel = void 0;
const mongoose_1 = require("mongoose");
const diagramSchema = new mongoose_1.Schema({
    id: Number,
    name: String,
    owner_name: String,
});
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    currentToken: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
exports.EventModel = (0, mongoose_1.model)("Diagram", diagramSchema);
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=index.js.map