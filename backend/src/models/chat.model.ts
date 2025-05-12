import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    query: String,
    response: { type: String, default: "" },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
