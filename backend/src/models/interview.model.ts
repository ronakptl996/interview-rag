import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    startTime: { type: Number, default: null },
    endTime: { type: Number, default: null },
    isStarted: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    name: { type: String, default: null },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
