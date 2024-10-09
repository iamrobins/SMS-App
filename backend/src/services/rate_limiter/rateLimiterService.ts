import redisClient from "../../config/redisClient";

// Allow max 3 requests/minute and 10 requests/day per client
const rateLimits = {
  minute: { max: 3, window: 60 }, // seconds
  day: { max: 10, window: 86400 }, // seconds (24 hours)
};

// Helper function to check rate limits using Redis
const checkRateLimit = async (clientIP: string, phoneNumber: number) => {
  const key = `${clientIP}:${phoneNumber}`;

  const minuteKey = `${key}:minute`;
  const dayKey = `${key}:day`;

  // Get the current counts (convert to integer and default to 0 if null)
  const [minuteCount, dayCount] = await Promise.all([
    redisClient.get(minuteKey).then((count) => parseInt(count || "0", 10)),
    redisClient.get(dayKey).then((count) => parseInt(count || "0", 10)),
  ]);

  // Check if limits exceeded
  if (minuteCount >= rateLimits.minute.max || dayCount >= rateLimits.day.max) {
    const retryAfterMinute = await redisClient.ttl(minuteKey);
    const retryAfterDay = await redisClient.ttl(dayKey);

    // Ensure that the TTL for the day key is properly set
    let retryAfter = 0;
    if (dayCount >= rateLimits.day.max) {
      if (retryAfterDay === -2 || retryAfterDay === -1) {
        // Calculate the time until the end of the day if TTL isn't properly set
        retryAfter = rateLimits.day.window; // 24 hours in seconds
      } else {
        retryAfter = retryAfterDay;
      }
    } else {
      retryAfter = retryAfterMinute;
    }

    return { allowed: false, retryAfter };
  }

  // Increment counters with expiration set for windows
  await redisClient
    .multi()
    .incr(minuteKey)
    .expire(minuteKey, rateLimits.minute.window)
    .incr(dayKey)
    .expire(dayKey, rateLimits.day.window)
    .exec();

  return { allowed: true };
};

export default checkRateLimit;
