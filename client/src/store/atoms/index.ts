import { User } from "firebase/auth";
import { atom } from "recoil";

export const userState = atom<User | null>({
  key: "userState",
  default: null,
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
  default:
    `## Hello, I am \`Dmaid AI\` :) \n\nProfessional \`Mermaid diagram generation\` platform for creating high-quality technical diagrams.\n\n**Supported Diagram Types:**\nFlowchart, Sequence, Class, State, Entity Relationship, Gantt Charts, Pie Charts, Requirement, User Journey, Git Graph, Mindmaps, Timeline, Quadrant Chart, Packet, C4 Context, Block, Bar Graph\n\nProvide your specifications and receive production-ready diagrams instantly.\n\n*Developed by*\n\n~ [Swarnendu](https://www.linkedin.com/in/swarnendu-bhandari/)`,
});
