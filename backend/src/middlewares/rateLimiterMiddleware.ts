import { Request, Response, NextFunction } from "express";
import checkRateLimit from "../services/rate_limiter/rateLimiterService";
import exp from "constants";

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
      return res.status(429).json({
        message: "Rate limit exceeded",
        retryAfter: isAllowed.retryAfter, // Tells client when they can retry
      });
    }
    next(); // Move to the next middleware if allowed
  } catch (err) {
    next(err); // Forward error to global error handler
  }
};

export default rateLimiterMiddleware;
