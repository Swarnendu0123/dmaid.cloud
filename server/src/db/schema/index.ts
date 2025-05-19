import { model, Schema } from "mongoose";

const diagramSchema = new Schema({

  diagramName:{
    type:String,
    trim : true
  },

  code:{
    type:String,
    trim : true
  },

  view:{
    type:String,
    trim : true
  },

  ownerEmail:{
    type:String,
    trim : true
  },

  views:[{
  type : String,
  trim: true,
  }],

  edits:[{
  type : String,
  trim: true,
  }],

 
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  mode: {
    type: String,
    enum: ['publicView','publicEdit', 'private'],
    required: true,
    default: 'private'
  },
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

  views:[{
    type : String,
    trime: true,
  }],

  edits:[{
    type : String,
    trime: true,
  }],

  updatedAt: {
    type: Date,
    default: Date.now,
  }

});


export const Diagram = model("Diagram", diagramSchema);
export const User = model("User", userSchema);