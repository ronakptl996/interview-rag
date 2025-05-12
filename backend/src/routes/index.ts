import { Router } from "express";
import chatRoutes from "./chat.route";
import interviewRoutes from "./interview.route";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/interview", interviewRoutes);

export default router;
