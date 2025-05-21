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
  default: "",
});
