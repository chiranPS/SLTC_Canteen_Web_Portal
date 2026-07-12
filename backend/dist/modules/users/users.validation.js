import { z } from 'zod';
export const createAdminSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    universityId: z.string().min(3, 'University ID is required'),
    email: z.string().email('Invalid email format').refine((val) => val.endsWith('@sltc.ac.lk'), {
        message: 'Email must belong to the @sltc.ac.lk domain',
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string().optional(),
    nic: z.string().optional(),
});
export const updateAdminSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    universityId: z.string().min(3, 'University ID is required').optional(),
    email: z.string().email('Invalid email format').refine((val) => val.endsWith('@sltc.ac.lk'), {
        message: 'Email must belong to the @sltc.ac.lk domain',
    }).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phoneNumber: z.string().optional(),
    nic: z.string().optional(),
});
