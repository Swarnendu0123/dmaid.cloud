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
exports.generateTextTotitle = generateTextTotitle;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
// prompt: user question
//  instruction: how to behave
function generateTextTotitle(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructions = `
          You are an expert at converting English descriptions into concise and meaningful Mermaid.js diagram titles.
      
          Examples:
          
          1. Input: "Generate a client-server architecture-based Mermaid code."
             Output: "Client-Server Architecture"
      
          2. Input: "Show the login process from the user to the authentication server and database."
             Output: "Login Process Flow Diagram"
      
          Guidelines:
          - Generate clear, valid, and relevant titles.
          - Keep titles concise yet descriptive.
          - Use title case for proper formatting.
          - Do not use any Quotes (" or ') in the output.
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = yield model.generateContent([instructions, prompt]);
        return result.response.text();
    });
}
//# sourceMappingURL=text_to_title.js.map