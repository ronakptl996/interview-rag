import { Router } from "express";
import {
  getInterview,
  startInterview,
} from "../controllers/interview.controller";

const router = Router();

router.post("/start/:interviewId", startInterview);
router.get("/:interviewId", getInterview);

export default router;
