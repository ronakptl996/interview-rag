import { Router } from "express";
import {
  getInterview,
  startInterview,
  endInterview,
  getAnalysisInterview,
  getInterviews,
} from "../controllers/interview.controller";
import { authUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/start/:interviewId", authUser, startInterview);
router.get("/end/:interviewId", authUser, endInterview);
router.get("/list", authUser, getInterviews);

// Get analysis of an interview
router.get("/analysis/:interviewId", authUser, getAnalysisInterview);

// Get interview details
router.get("/:interviewId", authUser, getInterview);

export default router;
