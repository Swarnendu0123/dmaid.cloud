import { atom } from "recoil";
import { ChatMessage } from "../../types";

export const userNameState = atom<string>({
  key: "userNameState",
  default: "user",
});

export const cartState = atom({
  key: "cartState",
  default: [],
});

export const codeState = atom({
  key: "codeState",
  default: "",
});

export const chatState = atom({
  key: "chatState",
  default: `## Hello, I am \`Dmaid AI\` :) \n\nProfessional \`Mermaxid diagram generation\` platform for creating high-quality technical diagrams.\n\n**Supported Diagram Types:**\nFlowchart, Sequence, Class, State, Entity Relationship, Gantt Charts, Pie Charts, Requirement, User Journey, Git Graph, Mindmaps, Timeline, Quadrant Chart, Packet, C4 Context, Block, Bar Graph\n\nProvide your specifications and receive production-ready diagrams instantly.\n\n\`\`\`mermaid\nflowchart TD\n    A[💡 Brain] --> C{Creative Process}\n    B[❤️ Love] --> C\n    C --> D[🛠️ Development]\n    C --> E[🎨 Design]\n    C --> F[⚡ Innovation]\n    D --> G[🚀 Dmaid]\n    E --> G\n    F --> G\n    G --> H[👥 Users]\n    H --> I[🌟 Impact]\n    \n    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n    style B fill:#fce4ec,stroke:#880e4f,stroke-width:2px\n    style C fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n    style G fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px\n    style I fill:#fff3e0,stroke:#ef6c00,stroke-width:2px\n\`\`\`\n\n**Note: Review AI-generated diagrams for accuracy.**\n\n ~ Developed with ❤️, by [Swarnendu](https://www.linkedin.com/in/swarnendu-bhandari/)`,
});

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `## Hello, I am \`Dmaid AI\` :) \n\nProfessional \`Mermaid diagram generation\` platform for creating high-quality technical diagrams.\n\n**Supported Diagram Types:**\nFlowchart, Sequence, Class, State, Entity Relationship, Gantt Charts, Pie Charts, Requirement, User Journey, Git Graph, Mindmaps, Timeline, Quadrant Chart, Packet, C4 Context, Block, Bar Graph\n\nProvide your specifications and receive production-ready diagrams instantly.\n\n\`\`\`mermaid\nflowchart TD\n    A[💡 Brain] --> C{Creative Process}\n    B[❤️ Love] --> C\n    C --> D[🛠️ Development]\n    C --> E[🎨 Design]\n    C --> F[⚡ Innovation]\n    D --> G[🚀 Dmaid]\n    E --> G\n    F --> G\n    G --> H[👥 Users]\n    H --> I[🌟 Impact]\n    \n    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n    style B fill:#fce4ec,stroke:#880e4f,stroke-width:2px\n    style C fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n    style G fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px\n    style I fill:#fff3e0,stroke:#ef6c00,stroke-width:2px\n\`\`\`\n\n**Note: Review AI-generated diagrams for accuracy.**\n\n ~ Developed with ❤️, by [Swarnendu](https://www.linkedin.com/in/swarnendu-bhandari/)`,
  timestamp: new Date(),
};

export const conversationHistoryState = atom<ChatMessage[]>({
  key: "conversationHistoryState",
  default: [DEFAULT_WELCOME_MESSAGE],
});

export { DEFAULT_WELCOME_MESSAGE };
