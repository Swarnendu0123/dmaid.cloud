import { model, Schema } from "mongoose";

const diagramSchema = new Schema({
  id: Number,
  name: String,
  owner_name: String,
});

const userSchema = new Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  currentToken:{
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  }

});



export const EventModel = model("Diagram", diagramSchema);
export const User = model("User", userSchema);