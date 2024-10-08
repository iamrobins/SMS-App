import express, { Request, Response } from "express";
import redisClient from "./config/redisClient";
import pool from "./config/dbClient";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express.js + Redis!");
});

// Example route to get data from PostgreSQL
app.get("/pg-test", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res
      .status(200)
      .json({
        message: "PostgreSQL connected successfully",
        time: result.rows[0].now,
      });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to PostgreSQL", error });
  }
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
