import { Router } from "express";
import { getInterview } from "../controllers/interview.controller";

const router = Router();

router.get("/:interviewId", getInterview);

export default router;
