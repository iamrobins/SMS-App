import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redisClient";
import { ISMSProvider } from "../services/sms/interfaces";
import SMSProviderFactory from "../services/sms/SMSProviderFactory";
import { logSMSRequest } from "../services/log/logService";

export const sendSMS = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientIP = (req.headers["x-forwarded-for"] as string) || req.ip;
    if (!clientIP) {
      return next(new Error("Client IP not provided"));
    }
    const { phoneNumber, recipientPhoneNumber, message } = req.body;

    if (
      typeof phoneNumber !== "number" ||
      typeof recipientPhoneNumber !== "number" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const smsProvider: ISMSProvider =
      SMSProviderFactory.getSMSProvider(clientIP);

    const response = await smsProvider.sendSMS(
      phoneNumber,
      recipientPhoneNumber,
      message
    );

    await logSMSRequest(clientIP, phoneNumber, true);

    return res.status(200).json({ data: response });
  } catch (err) {
    next(err); // Forward error to global error handler
  }
};

// Helper to calculate statistics
export const getSMSStatistics = async (clientIP: string) => {
  const oneMinuteAgo = Date.now() - 60 * 1000; // Timestamp for 1 minute ago
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0); // Timestamp for the start of today

  const logKey = `sms_requests:${clientIP}`; // Redis key for storing SMS logs

  const logs = await redisClient.lRange(logKey, 0, -1);

  let smsLastMinute = 0;
  let smsToday = 0;

  logs.forEach((log) => {
    const parsedLog = JSON.parse(log);
    const timestamp = new Date(parsedLog.timestamp).getTime();

    if (timestamp >= oneMinuteAgo) {
      smsLastMinute++;
    }
    if (timestamp >= todayStart.getTime()) {
      smsToday++;
    }
  });

  return { smsLastMinute, smsToday };
};

export const getSMSUsageStatistics = async (req: Request, res: Response) => {
  try {
    const clientIP = req.ip;
    if (!clientIP)
      return res.status(400).json({ message: "Client IP not provided" });

    const statistics = await getSMSStatistics(clientIP);

    return res.json(statistics);
  } catch (error) {
    console.error("Error fetching SMS usage statistics:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
