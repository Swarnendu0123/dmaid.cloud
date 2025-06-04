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
  default: "## Hello, I am `Dmaid AI` :)\n\nI can help you create diagrams using Mermaid. I can Generate Multiple types of diagrams for you.\n\nYou can also use the examples provided to get started quickly.\n\n **Happy diagramming!** \n\n ~ from [Swarnendu](https://www.linkedin.com/in/swarnendu-bhandari/)",
});
