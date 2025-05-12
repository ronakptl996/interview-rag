import multer from "multer";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

const configPdfUpload = () => {
  const uploadDir = path.join(__dirname, "../../uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const filePath = path.join(uploadDir, file.originalname);
      if (fs.existsSync(filePath)) {
        return cb(new Error("File already exists"), uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"));
      }
    },
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
    },
  });
};

const uploadPdfFileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = configPdfUpload().single("file");
  upload(req, res, (err) => {
    if (err) {
      if (req?.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    next();
  });
};

export default uploadPdfFileMiddleware;
