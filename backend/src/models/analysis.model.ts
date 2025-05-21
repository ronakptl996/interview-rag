import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    analysis: { type: Object, default: {} },
  },
  { timestamps: true }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
