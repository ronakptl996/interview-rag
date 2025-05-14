import { Router } from "express";
import {
  getInterview,
  startInterview,
  endInterview,
  analysisInterview,
} from "../controllers/interview.controller";

const router = Router();

router.post("/start/:interviewId", startInterview);
router.get("/end/:interviewId", endInterview);
router.get("/analysis/:interviewId", analysisInterview);
router.get("/:interviewId", getInterview);

export default router;
