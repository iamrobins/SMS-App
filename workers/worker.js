const { createClient } = require("redis");
const { Pool } = require("pg");
require("dotenv").config();

// Helper function to retry an operation with exponential backoff
const retryOperation = async (operation, retries = 5, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt < retries) {
        console.error(
          `Attempt ${attempt} failed. Retrying in ${delay}ms...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error; // Out of retries
      }
    }
  }
};

// Initialize PostgreSQL connection using pg Pool with retry
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

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
  await retryOperation(() => pool.query(createTableQuery));
  console.log("Ensured 'sms_logs' table exists.");
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
  await retryOperation(() => pool.query(createTableQuery));
  console.log("Ensured 'rate_limit_error_logs' table exists.");
};

// Initialize Redis client with retry
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

const processLogs = async () => {
  while (true) {
    try {
      // Scan Redis for all keys matching the pattern "sms_requests:*"
      const { keys } = await redisClient.scan(0, {
        MATCH: "sms_requests:*",
        COUNT: 100, // Adjust the count depending on how many logs you expect
      });
      for (const key of keys) {
        const logData = await redisClient.lPop(key);

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

            await pool.query(query, values);
            console.log("SMS Log entry saved to database:", logEntry);
          } catch (dbError) {
            console.error("Error saving sms log to database:", dbError);
          }
        }
      }
    } catch (err) {
      console.error("Error retrieving sms logs from Redis:", err);
    }

    try {
      // Scan Redis for all keys matching the pattern "rate_limit_error:*"
      const { keys } = await redisClient.scan(0, {
        MATCH: "rate_limit_error:*",
        COUNT: 100, // Adjust the count depending on how many logs you expect
      });
      for (const key of keys) {
        const logData = await redisClient.lPop(key);

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

            await pool.query(query, values);
            console.log("Rate Limit Log entry saved to database:", logEntry);
          } catch (dbError) {
            console.error("Error saving rate limit log to database:", dbError);
          }
        }
      }
    } catch (err) {
      console.error("Error retrieving rate limit logs from Redis:", err);
    }

    // Wait 10 minutes before checking for new logs
    await new Promise((resolve) => setTimeout(resolve, 600000));
  }
};

// Connect to Redis with retry
retryOperation(() => redisClient.connect())
  .then(async () => {
    // Ensure the tables exist
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
