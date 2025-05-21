import { Request, Response } from "express";
import mongoose from "mongoose";
import Interview from "../models/interview.model";
import Analysis from "../models/analysis.model";
import Chat from "../models/chat.model";
import { getAnalysis } from "../connections/dbQdrant";

export const getInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const { _id: userId } = req.user!;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      throw new Error("Invalid interview ID");
    }

    const interview = await Interview.findOne({ userId, _id: interviewId });

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
    const { _id: userId } = req.user!;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    const interview = await Interview.findOne({ userId, _id: interviewId });

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
    const { _id: userId } = req.user!;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      isCompleted: false,
      userId,
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    interview.isCompleted = true;
    interview.isStarted = false;
    interview.endTime = Date.now();
    await interview.save();

    const chats = await Chat.find({
      interviewId,
      fileId: interview.fileId,
    });

    const analysis = await getAnalysis(chats);

    await Analysis.create({
      userId,
      interviewId,
      analysis,
    });

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

// Get analysis of an interview
export const getAnalysisInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const { _id: userId } = req.user!;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      isCompleted: true,
      userId,
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    const durationMs = interview.endTime - interview.startTime; // 6835198 milliseconds

    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));

    const analysis = await Analysis.findOne({
      interviewId,
      userId,
    });

    if (!analysis) {
      throw new Error("Analysis not generated!");
    }

    res.status(200).json({
      success: true,
      message: "Interview analysis fetched successfully",
      data: {
        analysis: {
          ...analysis?.analysis,
        },
        timeTaken: `${hours}h ${minutes}m ${seconds}s`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getInterviews = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user!;

    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Interviews fetched successfully",
      data: interviews,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
