import { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  initiatePayment = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.orderId;
    
    const result = await this.paymentService.initiatePayment(orderId as string, userId);
    res.status(200).json(successResponse('Payment initiated', result));
  };

  handleWebhook = async (req: Request, res: Response) => {
    // In production with Stripe, you need the raw unparsed body. 
    // For this mock demo, we reconstruct the payload string from req.body.
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-mock-signature'] as string || '';

    await this.paymentService.handleWebhook(payload, signature);
    
    // Always respond 200 OK to webhooks to prevent retries if successfully processed
    res.status(200).send('OK');
  };
}
