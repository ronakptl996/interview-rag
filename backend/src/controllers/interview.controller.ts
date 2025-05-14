import { Request, Response } from "express";
import mongoose from "mongoose";
import Interview from "../models/interview.model";
import Chat from "../models/chat.model";
import { getAnalysis } from "../connections/dbQdrant";

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

export const startInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    interview.isStarted = true;
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview started successfully",
      data: interview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const endInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      isCompleted: false,
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    interview.isCompleted = true;
    interview.isStarted = false;
    interview.endTime = Date.now();
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview ended successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const analysisInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const chats = await Chat.find({
      interviewId,
      fileId: interview.fileId,
    });

    const analysis = await getAnalysis(chats);

    res.status(200).json({
      success: true,
      message: "Interview analysis fetched successfully",
      data: analysis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
