// TwilioSMSProvider.ts
import { ISMSProvider } from "./interfaces";

export default class TwilioSMSProvider implements ISMSProvider {
  async sendSMS(
    phoneNumber: number,
    recipientPhoneNumber: number,
    message: string
  ): Promise<any> {
    try {
      // Fake twilioClient
      const twilioClient = {
        messages: {
          create: async ({
            to,
            from,
            body,
          }: {
            to: number;
            from: number;
            body: string;
          }) => {
            return { sid: "12345", to, from, body }; // Fake response for demo
          },
        },
      };

      const response = await twilioClient.messages.create({
        to: recipientPhoneNumber,
        from: phoneNumber,
        body: message,
      });

      return response;
    } catch (error) {
      throw new Error("Failed to send SMS via Twilio");
    }
  }
}
