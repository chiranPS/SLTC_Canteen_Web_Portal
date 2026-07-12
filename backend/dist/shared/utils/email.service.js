import { logger } from '../../config/logger.js';
import { env } from '../../config/env.config.js';
export class EmailService {
    async sendVerificationEmail(to, token) {
        const url = `http://localhost:${env.PORT}/api/v1/auth/verify-email?token=${token}`;
        // Using mock email sending for development
        logger.info(`[EmailService] Sending Verification Email to ${to}`);
        logger.info(`[EmailService] Verification URL: ${url}`);
    }
    async sendPasswordResetEmail(to, token) {
        const url = `http://localhost:3000/reset-password?token=${token}`;
        logger.info(`[EmailService] Sending Password Reset Email to ${to}`);
        logger.info(`[EmailService] Reset URL: ${url}`);
    }
    async sendEmail(to, subject, html) {
        // Using mock email sending for development
        logger.info(`[EmailService] Sending Generic Email to ${to}. Subject: ${subject}`);
        logger.debug(`[EmailService] HTML Content: ${html}`);
    }
}
