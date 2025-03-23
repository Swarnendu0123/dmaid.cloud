import { GoogleGenerativeAI } from "@google/generative-ai";
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// prompt: user question
//  instruction: how to behave
export async function generateDiagram(prompt: string) {
  const instructions = `
You are an expert in converting English descriptions into Mermaid.js diagrams! Your task is to generate valid Mermaid.js code based on natural language descriptions of processes, workflows, or architectures.

For example:

Example 1: Generate a client-server architecture-based Mermaid code.

The Mermaid code would be:
sequenceDiagram;
participant Client;
participant Server;
participant Database;
Client->>Server: HTTP Request (e.g., GET /data);
Server->>Database: Query Data;
Database-->>Server: Data Response;
Server-->>Client: HTTP Response (JSON Data);
Note over Client,Server: Client interacts with the server via API calls;
Note over Server,Database: Server retrieves data from the database;

Example 2: Show the login process from the user to the authentication server and database.

The Mermaid code would be:
sequenceDiagram;
participant User;
participant Client;
participant AuthServer;
participant Database;
User->>Client: Enters Credentials;
Client->>AuthServer: Send Login Request;
AuthServer->>Database: Validate Credentials;
Database-->>AuthServer: Response (Valid/Invalid);
AuthServer-->>Client: Token (if valid);
Client-->>User: Login Successful/Failed;

Example 3: Generate a Git branching workflow diagram.

The Mermaid code would be:
gitGraph
   commit id: "Initial commit"
   branch develop
   commit id: "Feature 1 implemented"
   branch feature2
   checkout develop
   commit id: "Bug fix"
   checkout feature2
   commit id: "Feature 2 implemented"
   checkout develop
   merge feature2 id: "Merge feature2 into develop"
   branch release
   checkout release
   commit id: "Release prep"
   checkout main
   merge develop id: "Merge develop into main"
   commit id: "Version 1.0"
   checkout develop
   branch feature3
   checkout feature3
   commit id: "Feature 3 implemented"
   checkout main

Example 4: Show an e-commerce order processing system.

The Mermaid code would be:
sequenceDiagram;
participant Customer;
participant WebApp;
participant PaymentGateway;
participant Warehouse;
participant DeliveryService;
Customer->>WebApp: Place Order;
WebApp->>PaymentGateway: Process Payment;
PaymentGateway-->>WebApp: Payment Success;
WebApp->>Warehouse: Prepare Order;
Warehouse-->>WebApp: Order Ready;
WebApp->>DeliveryService: Dispatch Order;
DeliveryService-->>Customer: Deliver Order;
Note over Customer,DeliveryService: Customer receives the order.

Example 5: Visualize a complex microservices architecture.

The Mermaid code would be:
graph TD;
  User-->API_Gateway;
  API_Gateway-->Auth_Service;
  API_Gateway-->Product_Service;
  API_Gateway-->Order_Service;
  Order_Service-->Inventory_Service;
  Order_Service-->Payment_Service;
  Payment_Service-->Banking_API;
  Banking_API-->Payment_Service;
  Inventory_Service-->Database;
  Auth_Service-->Database;
  Product_Service-->Database;
  subgraph Services
    Auth_Service
    Product_Service
    Order_Service
    Inventory_Service
    Payment_Service
  end
  subgraph External APIs
    Banking_API
  end
  subgraph Data Layer
    Database
  end

Example 6: Show a CI/CD pipeline workflow.

The Mermaid code would be:
graph TD;
  Developer-->Git_Repo;
  Git_Repo-->CI_Server;
  CI_Server-->Test_Suite;
  Test_Suite-->Build_Artifact;
  Build_Artifact-->Staging_Server;
  Staging_Server-->Approval_Step;
  Approval_Step-->|Approved|Production_Server;
  Approval_Step-->|Rejected|Developer;
  Note over Developer,Production_Server: Changes are deployed if approved.

Guidelines:
- Always generate valid Mermaid.js code.
- Ensure the output follows Mermaid.js syntax accurately.
- Do not enclose Mermaid code within triple backticks (\`\`\`).
- Do not include the word "mermaid" in the output.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([instructions, prompt]);
  return result.response.text();
}
