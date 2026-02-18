import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
