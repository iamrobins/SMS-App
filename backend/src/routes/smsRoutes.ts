import express from "express";
import { sendSMS } from "../controllers/smsController";
const router = express.Router();

router.post("/send-sms", sendSMS);

export default router;
