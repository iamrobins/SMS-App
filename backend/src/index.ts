import express, { Request, Response } from "express";
import redisClient from "./config/redisClient";
import { dbClient } from "./config/dbClient";
import { User } from "./entity/User";
import smsRoutes from "./routes/smsRoutes";
import logRoutes from "./routes/logsRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api/sms", smsRoutes);
app.use("/api/logs", logRoutes);

app.get("/users", async (req, res) => {
  const users = await dbClient.getRepository(User).find();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = dbClient.getRepository(User).create(req.body);
  const result = await dbClient.getRepository(User).save(user);
  res.send(result);
});

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send(req.socket.remoteAddress);
  res.send("Hello, TypeScript + Express.js + Redis!");
});

// Route to set a value in Redis
app.post("/set", async (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ message: "Key and value are required." });
  }

  try {
    await redisClient.set(key, value);
    res.status(200).json({ message: `Key "${key}" set to "${value}".` });
  } catch (error) {
    res.status(500).json({ message: "Error setting value in Redis.", error });
  }
});

// Route to get a value from Redis
app.get("/get/:key", async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const value = await redisClient.get(key);
    if (value === null) {
      return res.status(404).json({ message: `Key "${key}" not found.` });
    }
    res.status(200).json({ key, value });
  } catch (error) {
    res.status(500).json({ message: "Error getting value from Redis.", error });
  }
});

// Start the server
app.listen(PORT, async () => {
  dbClient.initialize().then(() => {
    console.log("DB has been initialized!");
  });
  console.log(`Server is running on port ${PORT}`);
  await redisClient.connect();
});
