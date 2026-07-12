import { EventEmitter } from 'events';
import { logger } from '../../config/logger.js';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
export class NotificationQueue extends EventEmitter {
    emailService;
    constructor(emailService) {
        super();
        this.emailService = emailService;
        // Listen for the 'send_email' event
        this.on('send_email', async (job) => {
            await this.processEmailJob(job);
        });
    }
    async processEmailJob(job) {
        const currentAttempt = job.retryCount || 0;
        try {
            await this.emailService.sendEmail(job.to, job.subject, job.html);
            logger.info(`[NotificationQueue] Successfully sent email to ${job.to}`);
        }
        catch (error) {
            if (currentAttempt < MAX_RETRIES) {
                logger.warn(`[NotificationQueue] Failed to send email to ${job.to}. Retrying in ${RETRY_DELAY_MS / 1000}s... (Attempt ${currentAttempt + 1} of ${MAX_RETRIES})`);
                setTimeout(() => {
                    this.emit('send_email', { ...job, retryCount: currentAttempt + 1 });
                }, RETRY_DELAY_MS);
            }
            else {
                logger.error(`[NotificationQueue] Permanently failed to send email to ${job.to} after ${MAX_RETRIES} retries.`, error);
            }
        }
    }
    /**
     * Adds an email job to the queue
     */
    dispatchEmail(to, subject, html) {
        this.emit('send_email', { to, subject, html, retryCount: 0 });
    }
}
