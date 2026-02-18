import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    conversationId: {
      type: String,
      default: "default",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
