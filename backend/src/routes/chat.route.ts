import { Router } from "express";
import uploadPdfFileMiddleware from "../middlewares/multer.middleware";
import {
  uploadPdfFile,
  answerQuestion,
  askQuestionFromPdf,
} from "../controllers/chat.controller";

const router = Router();

router.post("/upload", uploadPdfFileMiddleware, uploadPdfFile);
router.post("/askQuestion", askQuestionFromPdf);
router.post("/answer", answerQuestion);

export default router;
