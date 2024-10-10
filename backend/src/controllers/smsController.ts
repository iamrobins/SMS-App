import { Request, Response, NextFunction } from "express";
import { ISMSProvider } from "../services/sms/interfaces";
import SMSProviderFactory from "../services/sms/SMSProviderFactory";
import { logSMSRequest } from "../services/log/logService";

export const sendSMS = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientIP = req.ip;
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
