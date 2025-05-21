import { Request, Response } from "express";
import User from "../models/user.model";

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email or Password is required!");
    }

    const userData = await User.findOne({ email });

    if (!userData) {
      throw new Error("User not found!");
    }

    const isMatch = await userData.isPasswordCorrect(password);

    if (!isMatch) {
      throw new Error("Invalid Credentials!");
    }

    const token = await userData.generateToken();

    return res.status(200).json({
      success: true,
      data: token,
      message: "User logged in successfully",
    });
  } catch (error: any) {
    console.log("Error >>>", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

export const signUp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email or Password is required!");
    }

    const userData = await User.findOne({ email });

    if (userData) {
      throw new Error("User already exists!");
    }

    const data = await User.create({ email, password });

    return res.status(201).json({
      success: true,
      data,
      message: "User sign up successfully",
    });
  } catch (error: any) {
    console.log("Error >>>", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
