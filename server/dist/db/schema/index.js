"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Diagram = void 0;
const mongoose_1 = require("mongoose");
const diagramSchema = new mongoose_1.Schema({
    diagramName: {
        type: String,
        trim: true
    },
    code: {
        type: String,
        trim: true
    },
    view: {
        type: String,
        trim: true
    },
    ownerEmail: {
        type: String,
        trim: true
    },
    views: [{
            type: String,
            trime: true,
        }],
    edits: [{
            type: String,
            trime: true,
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    mode: {
        type: String,
        enum: ['publicView', 'publicEdit', 'private'],
        required: true,
        default: 'private'
    },
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
    views: [{
            type: String,
            trime: true,
        }],
    edits: [{
            type: String,
            trime: true,
        }],
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
exports.Diagram = (0, mongoose_1.model)("Diagram", diagramSchema);
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=index.js.map