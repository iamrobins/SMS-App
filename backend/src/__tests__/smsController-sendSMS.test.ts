import request from "supertest";
import { app } from "../index";
import redisClient from "../config/redisClient";

describe("Send SMS with Rate Limiting", () => {
  const phoneNumber = Math.floor(Math.random() * 10000000);
  beforeAll(async () => {
    // Ensure Redis is connected before tests
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  });

  afterAll(async () => {
    // Disconnect Redis after tests to avoid open handle issues
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  test("Should allow 3 SMS requests and block the 4th", async () => {
    // First 3 requests should be successful
    for (let i = 1; i <= 3; i++) {
      const res = await request(app)
        .post("/api/sms/send-sms")
        .send({
          phoneNumber,
          recipientPhoneNumber: 777612,
          message: `Hello ${i}`,
        })
        .expect("Content-Type", /json/)
        .expect(200); // Expecting a 200 OK response

      // Check that the response body matches the expected structure
      expect(res.body).toEqual({
        data: {
          sid: "12345", // Assuming this is the API's response for `sid`
          to: 777612,
          from: phoneNumber,
          body: `Hello ${i}`, // Dynamically checking message content
        },
      });
    }

    // The 4th request should be blocked due to rate limiting
    const blockedRes = await request(app)
      .post("/api/sms/send-sms")
      .send({
        phoneNumber,
        recipientPhoneNumber: 777612,
        message: "Hello 4",
      })
      .expect(429); // Expecting a 429 Too Many Requests response

    // Verify the rate-limiting message in the response
    expect(blockedRes.body.message).toBe("Rate limit exceeded");
  });
});
