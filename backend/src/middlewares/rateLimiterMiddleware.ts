import { Request, Response, NextFunction } from "express";
import checkRateLimit from "../services/rate_limiter/rateLimiterService";
import { logRateLimitError } from "../services/log/logService";

const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber } = req.body;
  const clientIP = req.ip;

  if (!clientIP) {
    throw new Error("Client IP not provided");
  }

  if (typeof phoneNumber !== "number" || !phoneNumber) {
    throw new Error("Phone number not provided");
  }

  try {
    const isAllowed = await checkRateLimit(clientIP, phoneNumber);

    if (!isAllowed.allowed) {
      logRateLimitError(clientIP, phoneNumber, isAllowed.retryAfter || -1);
      return res.status(429).json({
        message: "Rate limit exceeded",
        retryAfter: isAllowed.retryAfter,
      });
    }
    next(); // Move to the next middleware
  } catch (err) {
    next(err); // Forward error to global error handler
  }
};

export default rateLimiterMiddleware;
