export interface PaymentIntentResult {
  checkoutUrl: string;
  transactionId: string;
}

export interface IPaymentProvider {
  /**
   * Initializes a payment session with the provider.
   * @param orderId The internal order ID
   * @param amount The total amount to charge
   * @param userEmail The email of the user
   */
  createPaymentIntent(orderId: string, amount: number, userEmail: string): Promise<PaymentIntentResult>;

  /**
   * Verifies the signature of an incoming webhook.
   * @param payload The raw body string from the webhook request
   * @param signature The signature header (e.g. Stripe-Signature)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;
}
