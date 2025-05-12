import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    isUploaded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);

export default File;
