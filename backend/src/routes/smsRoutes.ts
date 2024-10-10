import express from "express";
import { sendSMS, getSMSUsageStatistics } from "../controllers/smsController";
import rateLimiterMiddleware from "../middlewares/rateLimiterMiddleware";
const router = express.Router();

router.post("/send-sms", rateLimiterMiddleware, sendSMS);
router.get("/usage-statistics", getSMSUsageStatistics);

export default router;
