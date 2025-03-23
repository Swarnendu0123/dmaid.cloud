"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.EventModel = void 0;
const mongoose_1 = require("mongoose");
const diagramSchema = new mongoose_1.Schema({
    id: Number,
    name: String,
    owner_name: String,
});
const userSchema = new mongoose_1.Schema({
    name: String,
    email: String,
    //   other details
});
exports.EventModel = (0, mongoose_1.model)("Diagram", diagramSchema);
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=index.js.map