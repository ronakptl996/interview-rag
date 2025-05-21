import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface IUser {
  _id: string;
  email: string;
}

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("Token is missing!");
    }

    const decoded = (await jwt.verify(
      token,
      process.env.JWT_SECRET_TOKEN!
    )) as IUser;

    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }
};
