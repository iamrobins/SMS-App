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

  // Set necessary headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Helper function to send an SSE event
  const sendSSE = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  // Initial message to notify the client SSE is connected
  sendSSE(JSON.stringify({ message: "SSE connection established" }));

  // Variable to store the last sent log
  let lastSentLog: string | null = null;

  // Poll Redis for new log entries every second
  const interval = setInterval(async () => {
    try {
      // Fetch only the latest log entry from Redis
      const latestLog = await redisClient.lIndex(logType, -1);

      // If there's a new log and it's different from the last sent log
      if (latestLog && latestLog !== lastSentLog) {
        lastSentLog = latestLog; // Update the last sent log
        sendSSE(latestLog); // Send the new log to the client
      }
    } catch (error) {
      console.error("Error retrieving logs from Redis:", error);
    }
  }, 1000); // Adjust the interval as needed

  // Handle client disconnect
  req.on("close", () => {
    clearInterval(interval); // Stop polling Redis when client disconnects
    res.end();
  });
};
