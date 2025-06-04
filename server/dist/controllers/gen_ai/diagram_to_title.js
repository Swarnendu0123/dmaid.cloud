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
exports.generateDiagramToTitleWithGroq = generateDiagramToTitleWithGroq;
exports.generateDiagramToTitleWithAnthropic = generateDiagramToTitleWithAnthropic;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv = require("dotenv");
const instructions_1 = require("./instructions");
dotenv.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
// Groq AI model function
function generateDiagramToTitleWithGroq(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const ai_model = "meta-llama/llama-4-scout-17b-16e-instruct";
        const chatCompletion = yield getGroqChatCompletion(prompt, ai_model);
        console.log((_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content);
        // Print the completion returned by the LLM.
        return ((_d = (_c = chatCompletion.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || "";
    });
}
// Anthropic AI model function
function generateDiagramToTitleWithAnthropic(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const ai_model = "claude-sonnet-4-20250514"; // or claude-opus-4-20250514
        const chatCompletion = yield getAnthropicChatCompletion(prompt, ai_model);
        // Extract text from the response array
        const responseText = chatCompletion;
        console.log(responseText);
        // Print the completion returned by the LLM.
        return responseText;
    });
}
// Groq config
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
                content: instructions_1.instructions_diagram_to_title,
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
// Anthropic config
const getAnthropicChatCompletion = (prompt, ai_model) => __awaiter(void 0, void 0, void 0, function* () {
    return anthropic.messages.create({
        model: ai_model,
        max_tokens: 1024,
        temperature: 0.5,
        system: instructions_1.instructions_diagram_to_title,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    }
                ]
            }
        ]
    });
});
// Example usage:
// const groqResult = await generateDiagramToTitleWithGroq("Your prompt here");
// const anthropicResult = await generateDiagramToTitleWithAnthropic("Your prompt here");
//# sourceMappingURL=diagram_to_title.js.map