import { Request, Response } from "express";
import redisClient from "../config/redisClient";
enum LogType {
  SMS_REQUEST = "sms_requests",
  RATE_LIMIT_ERROR = "rate_limit_error",
}
export const streamLogs = async (req: Request, res: Response) => {
  const logType = req.query.logType;
  if (
    typeof logType !== "string" ||
    (logType != LogType.SMS_REQUEST && logType != LogType.RATE_LIMIT_ERROR)
  ) {
    return res.status(400).json({ message: "logType not provided" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendSSE = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendSSE(JSON.stringify({ message: "SSE connection established" }));

  let lastSentLog: string | null = null;

  const interval = setInterval(async () => {
    try {
      const latestLog = await redisClient.lIndex(logType, -1);

      if (latestLog && latestLog !== lastSentLog) {
        lastSentLog = latestLog;
        sendSSE(latestLog);
      }
    } catch (error) {
      console.error("Error retrieving logs from Redis:", error);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
};
