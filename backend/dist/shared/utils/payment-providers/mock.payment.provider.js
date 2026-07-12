import crypto from 'crypto';
import { env } from '../../../config/env.config.js';
import { logger } from '../../../config/logger.js';
export class MockPaymentProvider {
    async createPaymentIntent(orderId, amount, userEmail) {
        const transactionId = `txn_mock_${crypto.randomBytes(8).toString('hex')}`;
        const checkoutUrl = `http://localhost:${env.PORT}/mock-checkout?txn=${transactionId}`;
        logger.info(`[MockPaymentProvider] Created intent for Order ${orderId}. Amount: ${amount}. URL: ${checkoutUrl}`);
        return {
            transactionId,
            checkoutUrl,
        };
    }
    verifyWebhookSignature(payload, signature) {
        // In a mock scenario, we can just return true or validate a simple secret
        // For this demo, if there's any signature, we assume it's valid.
        return !!signature;
    }
}
