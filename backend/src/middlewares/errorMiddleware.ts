import { Request, Response } from "express";

const errorHandler = (err: Error, _: Request, res: Response) => {
  res.status(500).json({
    message: err.message,
    // Only include stack trace in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
