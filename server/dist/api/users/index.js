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
const middleware_1 = require("../../middleware/middleware");
const index_1 = require("../../db/schema/index");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/upsert', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, currentToken } = req.body;
        if (!email || !currentToken) {
            res.status(404).json({ error: 'email or current token is not provided' });
        }
        console.log(email, currentToken);
        const findUser = yield index_1.User.findOne({ email }).exec();
        console.log(findUser);
        let user;
        if (findUser) {
            user = yield index_1.User.findByIdAndUpdate(findUser._id, // filter
            { name, email, currentToken }, // update
            { new: true, runValidators: true } // options: return the updated doc
            ).exec();
        }
        else {
            user = new index_1.User({ name, email, currentToken });
            yield user.save();
        }
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.cookie('authToken', currentToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get('/:id', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield index_1.User.findById(req.params.id).exec();
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.put('/:id', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        const user = yield index_1.User.findByIdAndUpdate(req.params.id, updateData, { new: true }).exec();
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=index.js.map