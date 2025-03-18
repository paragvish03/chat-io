import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
