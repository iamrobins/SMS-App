import request from "supertest";
import { app } from "../index"; // Adjust the path to your app
import redisClient from "../config/redisClient";

describe("Get SMS Usage Statistics", () => {
  beforeAll(async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  });

  afterAll(async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  test("should return 200 and some SMS usage statistics", async () => {
    const res = await request(app)
      .get("/api/sms/usage-statistics")
      .set("ip", "::ffff:192.168.0.1") // Mock the IP address
      .expect(200);

    // Check if response body has keys (any statistics)
    expect(res.body).toHaveProperty("smsLastMinute");
    expect(res.body).toHaveProperty("smsToday");
  });
});
