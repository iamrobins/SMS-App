import express from "express";
import redisClient from "./config/redisClient";
import smsRoutes from "./routes/smsRoutes";
import logRoutes from "./routes/logsRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api/sms", smsRoutes);
app.use("/api/logs", logRoutes);

// Start the server
app.listen(PORT, async () => {
  await redisClient.connect();
  console.log(`Server is running on port ${PORT}`);
});
