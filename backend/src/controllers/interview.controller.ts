import { Request, Response } from "express";
import Interview from "../models/interview.model";
import mongoose from "mongoose";

export const getInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      throw new Error("Invalid interview ID");
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    res.status(200).json({
      success: true,
      message: "Interview fetched successfully",
      data: interview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
