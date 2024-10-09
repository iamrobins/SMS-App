import { ISMSProvider } from "./interfaces";
import TwilioSMSProvider from "./TwilioSMSProvider";

export default class SMSProviderFactory {
  static getSMSProvider(phoneNumber: string): ISMSProvider {
    // Depending on the phoneNumber or other factors, we can choose different providers.
    // For now, we'll always return the Twilio provider.
    return new TwilioSMSProvider();
  }
}
