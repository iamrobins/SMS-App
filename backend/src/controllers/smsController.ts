import { Request, Response, NextFunction } from "express";
import { ISMSProvider } from "../services/sms/interfaces";
import SMSProviderFactory from "../services/sms/SMSProviderFactory";

export const sendSMS = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientIP = req.ip;
    if (!clientIP) {
      throw new Error("Client IP not provided");
    }
    const { phoneNumber, recipientPhoneNumber, message } = req.body;

    // Validate the request body
    if (
      typeof phoneNumber !== "number" ||
      typeof recipientPhoneNumber !== "number" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Get the correct SMS provider based on clientIP or other factors
    const smsProvider: ISMSProvider =
      SMSProviderFactory.getSMSProvider(clientIP);

    // Use the provider to send the SMS
    const response = await smsProvider.sendSMS(
      phoneNumber,
      recipientPhoneNumber,
      message
    );

    // Log the request
    // await logRequest(clientIP, phoneNumber, response.status);

    return res.status(200).json({ data: response });
  } catch (err) {
    next(err); // Pass error to centralized error handler
  }
};
