import { model, Schema } from "mongoose";

const diagramSchema = new Schema({
  id: Number,
  name: String,
  owner_name: String,
});

const userSchema = new Schema({
  name: String,
  email: String,
  //   other details
});


export const EventModel = model("Diagram", diagramSchema);
export const UserModel = model("User", userSchema);