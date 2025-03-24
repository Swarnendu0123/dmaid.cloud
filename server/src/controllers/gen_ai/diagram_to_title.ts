import { GoogleGenerativeAI } from "@google/generative-ai";
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function generateDiagramToTitle(diagram: string) {
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
  const result = await model.generateContent([instructions, diagram]);
  return result.response.text();
}
