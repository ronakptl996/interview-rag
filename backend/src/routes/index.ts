import { Router } from "express";
import chatRoutes from "./chat.route";
import interviewRoutes from "./interview.route";
import userRoutes from "./user.route";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/interview", interviewRoutes);
router.use("/user", userRoutes);

export default router;
