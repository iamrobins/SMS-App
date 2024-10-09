export interface ISMSProvider {
  sendSMS(
    phoneNumber: number,
    recipientPhoneNumber: number,
    message: string
  ): Promise<any>;
}
