import express from "express";
import { sendSMS } from "../controllers/smsController";
import rateLimiterMiddleware from "../middlewares/rateLimiterMiddleware";
const router = express.Router();

router.post("/send-sms", rateLimiterMiddleware, sendSMS);

export default router;
