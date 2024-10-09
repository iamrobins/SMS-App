const { createClient } = require("redis");
const { Pool } = require("pg"); // Import the pg library
require("dotenv").config();

// Initialize PostgreSQL connection using pg Pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Function to ensure the table exists
const ensureSMSTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sms_logs (
      id SERIAL PRIMARY KEY,
      clientIP VARCHAR(255),
      phoneNumber BIGINT,
      status BOOLEAN,
      timestamp TIMESTAMPTZ
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Ensured 'sms_logs' table exists.");
  } catch (error) {
    console.error("Error creating 'sms_logs' table:", error);
    process.exit(1); // Exit process if table creation fails
  }
};

const ensureRateLimitErrorTableExists = async () => {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS rate_limit_error_logs (
        id SERIAL PRIMARY KEY,
        clientIP VARCHAR(255),
        phoneNumber BIGINT,
        retryAfter INTEGER,
        timestamp TIMESTAMPTZ
      )
    `;

  try {
    await pool.query(createTableQuery);
    console.log("Ensured 'rate_limit_error_logs' table exists.");
  } catch (error) {
    console.error("Error creating 'rate_limit_error_logs' table:", error);
    process.exit(1); // Exit process if table creation fails
  }
};

// Initialize Redis client
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Function to process logs from Redis and save them to PostgreSQL
const processLogs = async () => {
  while (true) {
    try {
      const logData = await redisClient.lPop("sms_requests");

      if (logData) {
        const logEntry = JSON.parse(logData);

        try {
          const query = `
            INSERT INTO sms_logs (clientIP, phoneNumber, status, timestamp)
            VALUES ($1, $2, $3, $4)
          `;
          const values = [
            logEntry.clientIP,
            logEntry.phoneNumber,
            logEntry.status,
            logEntry.timestamp,
          ];

          // Use pool.query to run the SQL query
          await pool.query(query, values);
          console.log("SMS Log entry saved to database:", logEntry);
        } catch (dbError) {
          console.error("Error saving sms log to database:", dbError);
        }
      }
    } catch (err) {
      console.error("Error retrieving sms log from Redis:", err);
    }

    try {
      const logData = await redisClient.lPop("rate_limit_error");

      if (logData) {
        const logEntry = JSON.parse(logData);

        try {
          const query = `
              INSERT INTO rate_limit_error_logs (clientIP, phoneNumber, retryAfter, timestamp)
              VALUES ($1, $2, $3, $4)
            `;
          const values = [
            logEntry.clientIP,
            logEntry.phoneNumber,
            logEntry.retryAfter,
            logEntry.timestamp,
          ];

          // Use pool.query to run the SQL query
          await pool.query(query, values);
          console.log(
            "Rate limit error log entry saved to database:",
            logEntry
          );
        } catch (dbError) {
          console.error(
            "Error saving rate limit error log to database:",
            dbError
          );
        }
      }
    } catch (err) {
      console.error("Error retrieving rate limit error log from Redis:", err);
    }

    // Wait before checking for new logs to avoid busy-waiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

// Ensure the Redis client is ready before processing logs
redisClient
  .connect()
  .then(async () => {
    // First, ensure the tables exists
    await ensureSMSTableExists();
    await ensureRateLimitErrorTableExists();
    // Start processing logs
    processLogs();
  })
  .catch((error) => {
    console.error("Error connecting to Redis:", error);
    process.exit(1); // Exit on Redis connection failure
  });

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await redisClient.quit();
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
