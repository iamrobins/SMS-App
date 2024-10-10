import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import redisClient from "./config/redisClient";
import smsRoutes from "./routes/smsRoutes";
import logRoutes from "./routes/logsRoutes";
import errorHandler from "./middlewares/errorMiddleware";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/sms", smsRoutes);
app.use("/api/logs", logRoutes);

app.use(errorHandler);

// Start the server
app.listen(PORT, async () => {
  await redisClient.connect();
  console.log(`Server is running on port ${PORT}`);
});
