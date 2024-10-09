// logService.js
import redisClient from "../../config/redisClient";

export const logSMSRequest = async (
  clientIP: string,
  phoneNumber: number,
  status: boolean
) => {
  const logEntry = JSON.stringify({
    type: "sms_request",
    clientIP,
    phoneNumber,
    status,
    timestamp: new Date(),
  });

  try {
    await redisClient.rPush("sms_requests", logEntry);
  } catch (error) {
    console.error("Error pushing sms logs to Redis:", error);
  }
};

export const logRateLimitError = async (
  clientIP: string,
  phoneNumber: number,
  retryAfter: number
) => {
  const logEntry = JSON.stringify({
    type: "rate_limit_error",
    clientIP,
    phoneNumber,
    retryAfter,
    timestamp: new Date(),
  });

  try {
    await redisClient.rPush("rate_limit_error", logEntry);
  } catch (error) {
    console.error("Error pushing rate limit error log to Redis:", error);
  }
};
