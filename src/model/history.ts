import { model, Schema, SchemaTypes } from "mongoose";

const historySchema = new Schema(
  {
    from: {
      type: SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: SchemaTypes.ObjectId,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model("chat-history", historySchema);
