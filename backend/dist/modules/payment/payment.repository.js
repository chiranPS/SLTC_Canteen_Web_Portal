import { PaymentStatus, OrderStatus } from '@prisma/client';
export class PaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPaymentRecord(orderId, amount, transactionId) {
        return this.prisma.payment.create({
            data: {
                orderId,
                amount,
                transactionId,
                status: PaymentStatus.PENDING,
            },
        });
    }
    async findPaymentByTransactionId(transactionId) {
        return this.prisma.payment.findFirst({
            where: { transactionId },
            include: {
                order: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }
    async markPaymentSuccess(paymentId, orderId, qrString) {
        // Atomic transaction to guarantee both Payment and Order update together
        return this.prisma.$transaction(async (tx) => {
            // 1. Update Payment
            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: { status: PaymentStatus.SUCCESS },
            });
            // 2. Update Order with QR code and status
            const order = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.PAID,
                    qrString: qrString
                },
            });
            return { payment, order };
        });
    }
    async markPaymentFailed(paymentId) {
        return this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.FAILED },
        });
    }
}
