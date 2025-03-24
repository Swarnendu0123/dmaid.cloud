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
exports.generateDiagramToTitle = generateDiagramToTitle;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
function generateDiagramToTitle(diagram) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructions = `
    You are an expert in generating concise and meaningful titles for Mermaid.js diagrams based on their code representation.

    ## Task:
    Given a Mermaid.js diagram, extract its key components and generate a descriptive title that accurately summarizes the diagram's purpose.

    ## Guidelines:
    - Ensure the title is **clear, concise, and relevant** to the given diagram.
    - Use **Title Case** for proper formatting.
    - Avoid using **quotes (" or ')** in the output.
    - Focus on **key themes**, such as authentication flows, data structures, or software development processes.
    - Maintain **brevity** while ensuring the title conveys essential details.

    ## Examples:

    ### Example 1:
    **Input (Mermaid Code):**
    \`\`\`
    sequenceDiagram;
      participant User;
      participant Client;
      participant AuthServer;
      participant OAuthProvider;
      participant Database;
      participant ResourceServer;

      User->>Client: Login via OAuth;
      Client->>OAuthProvider: Request Auth Code;
      OAuthProvider-->>Client: Authorization Code;
      Client->>OAuthProvider: Exchange Code for Token;
      OAuthProvider-->>Client: Access Token & Refresh Token;
      Client->>AuthServer: Validate Token;
      AuthServer->>Database: Fetch User Roles & Permissions;
      Database-->>AuthServer: User Data & Roles;
      AuthServer-->>Client: Verified User Data;
      Client->>ResourceServer: Request Protected Resource;
      ResourceServer->>AuthServer: Validate User Permissions;
      AuthServer-->>ResourceServer: Access Granted;
      ResourceServer-->>Client: Return Resource;
    \`\`\`
    
    **Expected Output:**  
    Advanced Authentication and Authorization Flow With OAuth, JWT, and RBAC

    ---

    ### Example 2:
    **Input (Mermaid Code):**
    \`\`\`
    gitGraph
      commit id: "Initial commit"
      branch develop
      commit id: "Setup project structure"
      branch feature/auth
      commit id: "Implement authentication"
      checkout develop
      branch feature/ui
      commit id: "Develop UI components"
      checkout feature/auth
      commit id: "Add OAuth support"
      checkout develop
      merge feature/auth id: "Merge authentication"
      checkout feature/ui
      commit id: "Enhance UI with animations"
      checkout develop
      merge feature/ui id: "Merge UI components"
      branch hotfix/login-bug
      checkout hotfix/login-bug
      commit id: "Fix login issue in production"
      checkout main
      merge hotfix/login-bug id: "Deploy hotfix"
      checkout develop
      branch feature/checkout
      commit id: "Implement checkout flow"
      checkout develop
      merge feature/checkout id: "Merge checkout"
    \`\`\`
    
    **Expected Output:**  
    Git Workflow With Feature Branching, Hotfixes, and Merging Strategies
  `;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = yield model.generateContent([instructions, diagram]);
        return result.response.text();
    });
}
//# sourceMappingURL=diagram_to_title.js.map