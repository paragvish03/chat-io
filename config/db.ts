import mongoose from "mongoose";

mongoose
  .connect("mongodb+srv://suraj:suraj%405151@cluster0.oodet.mongodb.net/chat-io?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err: any) => {
    console.error("Connection error", err);
  });
