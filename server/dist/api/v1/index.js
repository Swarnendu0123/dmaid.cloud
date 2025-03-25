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
const text_to_diagram_1 = require("../../controllers/gen_ai/text_to_diagram");
const text_to_title_1 = require("../../controllers/gen_ai/text_to_title");
const diagram_to_title_1 = require("../../controllers/gen_ai/diagram_to_title");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send({
        message: "Welcome to dmaid.cloud server!",
        ref_docs: [
            "https://expressjs.com/en/5x/api.html",
            "https://mongoosejs.com/docs/guide.html",
        ],
        version: "V1",
        routes: {
            "info routes": {
                "GET '/'": "should redirect to '/api/v1'",
                "GET '/api/v1'": "should display all the API Route information",
            },
            "diagram Routes": {
                "GET '/api/v1/diagram/:uuid'": "to get a specific diagram",
                "POST '/api/v1/diagram/create'": "to save a specific diagram for the first time",
                "PUT '/api/v1/diagram/edit/:uuid'": "to edit a specific diagram",
            },
            "access control routes": {
                "PUT '/api/v1/control/view/:email'": "to give view access of a specific file (check owner)",
                "PUT '/api/v1/control/edit/:email'": "to give the edit access of a specific diagram (check owner)",
                "PUT '/api/v1/control/transfer/:email'": "to transfer the ownership to a specific user",
            },
            "AI Routes": {
                "POST 'api/v1/diagram/generate'": "to generate a diagram using GEN AI",
            },
        },
    });
});
// route to generate diagrams based on prompt
router.post("/diagram/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prompt = req.body.prompt;
        console.log(prompt);
        const generated_diagram = yield (0, text_to_diagram_1.generateTextToDiagramWithGorq)(prompt);
        const generated_title = yield (0, text_to_title_1.generateTextTotitle)(prompt);
        console.log(generated_diagram);
        console.log(generated_title);
        res.send({
            messege: "Diagram generated",
            diagram: generated_diagram,
            title: generated_title,
            success: true,
        });
    }
    catch (e) {
        res.send({ message: "Error in generating the response!", success: false });
    }
}));
// route to generate titles based on diagrams
router.post("/title/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const diagram = req.body.diagram;
        console.log(diagram);
        const generated_title = yield (0, diagram_to_title_1.generateDiagramToTitle)(diagram);
        console.log(generated_title);
        res.send({
            messege: "Title generated",
            title: generated_title,
            success: true,
        });
    }
    catch (e) {
        res.send({ message: "Error in generating the title!", success: false });
    }
}));
exports.default = router;
//# sourceMappingURL=index.js.map