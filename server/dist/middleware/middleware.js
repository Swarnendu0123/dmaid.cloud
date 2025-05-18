"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const index_1 = require("../db/schema/index"); // adjust path to your user model
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken;
        console.log(token);
        if (!token) {
            res.status(401).json({ error: 'Authentication token missing' });
            return;
        }
        const user = yield index_1.User.findOne({ currentToken: token }).exec();
        if (!user || user.currentToken !== token) {
            res.status(403).json({ error: 'Invalid token or user not found' });
            return;
        }
        req.userId = user.id;
        req.email = user.email;
        req.name = user.name;
        next(); // Proceed to the route
    }
    catch (error) {
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
});
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=middleware.js.map