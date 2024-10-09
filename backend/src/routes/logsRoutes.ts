import express from "express";
import { streamLogs } from "../controllers/logsController";
const router = express.Router();

router.get("/stream-logs", streamLogs);

export default router;
