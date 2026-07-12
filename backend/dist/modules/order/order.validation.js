import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
export const checkoutSchema = z.object({
    pickupTime: z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
    }, 'Pickup time must be a valid future date and time'),
});
export const updateStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus, {
        message: 'Invalid order status'
    }),
});
export const queryOrdersSchema = z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
    categoryId: z.string().optional(),
    search: z.string().optional(),
});
export const verifyQrSchema = z.object({
    token: z.string().min(1, 'QR token is required'),
});
