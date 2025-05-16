import { Router } from "express";
import {
  getInterview,
  startInterview,
  endInterview,
  getAnalysisInterview,
  getInterviews,
} from "../controllers/interview.controller";

const router = Router();

router.post("/start/:interviewId", startInterview);
router.get("/end/:interviewId", endInterview);
router.get("/list", getInterviews);

// Get analysis of an interview
router.get("/analysis/:interviewId", getAnalysisInterview);

// Get interview details
router.get("/:interviewId", getInterview);

export default router;
