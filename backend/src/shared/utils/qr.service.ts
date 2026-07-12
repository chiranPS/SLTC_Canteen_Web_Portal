import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.config.js';

export interface QRPayload {
  orderId: string;
  orderNumber: string;
}

export class QRService {
  /**
   * Generates a base64 encoded PNG QR code from a string payload.
   * @param payload The string data to encode (e.g. order details)
   */
  async generateQRCodeBase64(payload: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 300,
      });
      return qrCodeDataUrl;
    } catch (error) {
      logger.error('Failed to generate QR Code', error);
      throw new Error('QR Code generation failed');
    }
  }

  /**
   * Generates a signed JWT containing order details.
   */
  generateSecureToken(payload: QRPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '24h', // Token expires in 24 hours to prevent stale collections
    });
  }

  /**
   * Verifies the signed JWT and extracts the payload.
   */
  verifySecureToken(token: string): QRPayload {
    return jwt.verify(token, env.JWT_SECRET) as QRPayload;
  }
}
