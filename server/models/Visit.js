import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    date: {
      type: String, // store date like "2026-02-20"
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Visit", visitSchema);