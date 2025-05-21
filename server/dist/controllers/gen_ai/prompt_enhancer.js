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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTextTotitleWithGemini = generateTextTotitleWithGemini;
exports.enhancePromptWithGroq = enhancePromptWithGroq;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = require("dotenv");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const instructions_1 = require("./instructions");
dotenv.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
// prompt: user question
//  instruction: how to behave
function generateTextTotitleWithGemini(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = yield model.generateContent([instructions_1.instructions_prompt_enhancer, prompt]);
        return result.response.text();
    });
}
// Gorq gen AI model
function enhancePromptWithGroq(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const ai_model = "meta-llama/llama-4-scout-17b-16e-instruct";
        const chatCompletion = yield getGroqChatCompletion(prompt, ai_model);
        // Print the completion returned by the LLM.
        return ((_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
    });
}
// grok config
const getGroqChatCompletion = (prompt, ai_model) => __awaiter(void 0, void 0, void 0, function* () {
    return groq.chat.completions.create({
        //
        // Required parameters
        //
        messages: [
            // Set an optional system message. This sets the behavior of the
            // assistant and can be used to provide specific instructions for
            // how it should behave throughout the conversation.
            {
                role: "system",
                content: instructions_1.instructions_prompt_enhancer,
            },
            // Set a user message for the assistant to respond to.
            {
                role: "user",
                content: prompt,
            },
        ],
        // The language model which will generate the completion.
        model: ai_model,
        //
        // Optional parameters
        //
        // Controls randomness: lowering results in less random completions.
        // As the temperature approaches zero, the model will become deterministic
        // and repetitive.
        temperature: 0.5,
        // The maximum number of tokens to generate. Requests can use up to
        // 2048 tokens shared between prompt and completion.
        max_completion_tokens: 1024,
        // Controls diversity via nucleus sampling: 0.5 means half of all
        // likelihood-weighted options are considered.
        top_p: 1,
        // A stop sequence is a predefined or user-specified text string that
        // signals an AI to stop generating content, ensuring its responses
        // remain focused and concise. Examples include punctuation marks and
        // markers like "[end]".
        stop: null,
        // If set, partial message deltas will be sent.
        stream: false,
    });
});
//# sourceMappingURL=prompt_enhancer.js.map