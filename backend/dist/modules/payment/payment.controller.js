import { successResponse } from '../../shared/responses/apiResponse.js';
export class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    initiatePayment = async (req, res) => {
        const userId = req.user.id;
        const orderId = req.params.orderId;
        const result = await this.paymentService.initiatePayment(orderId, userId);
        res.status(200).json(successResponse('Payment initiated', result));
    };
    handleWebhook = async (req, res) => {
        // In production with Stripe, you need the raw unparsed body. 
        // For this mock demo, we reconstruct the payload string from req.body.
        const payload = JSON.stringify(req.body);
        const signature = req.headers['x-mock-signature'] || '';
        await this.paymentService.handleWebhook(payload, signature);
        // Always respond 200 OK to webhooks to prevent retries if successfully processed
        res.status(200).send('OK');
    };
}
