import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    startTime: { type: Number, default: null },
    endTime: { type: Number, default: null },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
