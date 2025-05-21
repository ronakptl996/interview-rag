import { Router } from "express";
import uploadPdfFileMiddleware from "../middlewares/multer.middleware";
import {
  uploadPdfFile,
  answerQuestion,
  askQuestionFromPdf,
} from "../controllers/chat.controller";
import { authUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/upload", authUser, uploadPdfFileMiddleware, uploadPdfFile);
router.post("/askQuestion", authUser, askQuestionFromPdf);
router.post("/answer", authUser, answerQuestion);

export default router;
