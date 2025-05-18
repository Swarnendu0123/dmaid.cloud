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
const express_1 = require("express");
const index_1 = require("../../db/schema/index");
const middleware_1 = require("../../middleware/middleware"); // optional
const router = (0, express_1.Router)();
var Mode;
(function (Mode) {
    Mode[Mode["private"] = 0] = "private";
    Mode[Mode["publicView"] = 1] = "publicView";
    Mode[Mode["publicEdit"] = 2] = "publicEdit";
})(Mode || (Mode = {}));
// Create a new diagram
router.post('/', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const diagram = new index_1.Diagram(Object.assign(Object.assign({}, payload), { ownerEmail: req.email }));
        yield diagram.save();
        res.status(201).json(diagram);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Get all diagrams (optionally filter by owner)
router.get('/', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.ownerEmail
            ? { ownerEmail: req.query.ownerEmail }
            : { ownerEmail: req.email };
        const diagrams = yield index_1.Diagram.find(filter).exec();
        res.json(diagrams);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Get a single diagram by ID
router.get('/:id/:mode', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mode = req.params.mode;
        const diagram = yield index_1.Diagram.findById(req.params.id).exec();
        if (!diagram) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (diagram.mode !== mode) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        let access, allowed;
        console.log(req.email, diagram.edits, diagram.view);
        if (diagram.mode === 'private') {
            if (diagram.ownerEmail === req.email) {
                access = "owner";
                allowed = true;
            }
            else if (diagram.views.includes(req.email)) {
                access = "viewer";
                allowed = true;
            }
            else if (diagram.edits.includes(req.email)) {
                access = "editor";
                allowed = true;
            }
            else {
                access = "no-acess";
                allowed = false;
            }
        }
        else if (diagram.mode === 'publicView') {
            access = "viewer";
            allowed = true;
        }
        else if (diagram.mode === 'publicEdit') {
            access = "editor";
            allowed = true;
        }
        if (!allowed) {
            res.status(400).json({
                msg: "sorry you are prohibited to access this document"
            });
            return;
        }
        res.json({
            diagram,
            access,
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Update an existing diagram
router.put('/:id', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = req.body;
        const diagram = yield index_1.Diagram.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).exec();
        if (!diagram) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(diagram);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Delete a diagram
router.delete('/:id', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield index_1.Diagram.findByIdAndDelete(req.params.id).exec();
        if (!result) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Append a “view” entry
router.post('/:id/views', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { viewerEmail } = req.body;
        const diagram = yield index_1.Diagram.findByIdAndUpdate(req.params.id, { $addToSet: { edits: viewerEmail } }, { new: true }).exec();
        if (!diagram) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(diagram);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Append an “edit” entry
router.post('/:id/edits', middleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { editorEmail } = req.body;
        const diagram = yield index_1.Diagram.findByIdAndUpdate(req.params.id, { $addToSet: { edits: editorEmail } }, { new: true }).exec();
        if (!diagram) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(diagram);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
exports.default = router;
//# sourceMappingURL=index.js.map