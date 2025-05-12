import fs from "fs";
import { Request, Response } from "express";
import File from "../models/file.model";
import Chat from "../models/chat.model";
import Interview from "../models/interview.model";
import { uploadPDFToQdrant, getNextQuestion } from "../connections/dbQdrant";

export const uploadPdfFile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const filePath = req.file!.path;

    const file = await File.create({
      name: req.file?.originalname,
      path: filePath,
    });

    await uploadPDFToQdrant(filePath, file._id.toString());

    const updatedFile = await File.findByIdAndUpdate(
      file._id,
      {
        isUploaded: true,
      },
      {
        new: true,
      }
    );

    const interview = await Interview.create({
      fileId: file._id,
      startTime: Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: { ...updatedFile, interviewId: interview._id },
    });
  } catch (error: any) {
    fs.unlinkSync(req.file!.path);
    console.log("Error while uploading file ", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const answerQuestion = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { chatId, answer } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
      response: answer,
    });

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: updatedChat,
    });
  } catch (error: any) {
    console.log("Error while chatting ", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const askQuestionFromPdf = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { fileId } = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const previousChats =
      (await Chat.find({ fileId }).select("query response")) || [];

    const question = await getNextQuestion(fileId, previousChats);

    const chat = await Chat.create({
      fileId,
      query: question,
    });

    return res.status(200).json({
      success: true,
      message: "Question asked successfully",
      data: {
        question,
        chatId: chat._id,
      },
    });
  } catch (error: any) {
    console.log("Error while getting question from pdf ", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
