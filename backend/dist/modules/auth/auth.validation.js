import { z } from 'zod';
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    universityId: z.string().min(3, 'University ID is required'),
    email: z.string().email('Invalid email format').refine((val) => val.endsWith('@sltc.ac.lk'), {
        message: 'Email must belong to the @sltc.ac.lk domain',
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    universityId: z.string().min(3, 'University ID is required').optional(),
    phoneNumber: z.string().optional(),
    nic: z.string().optional(),
    address: z.string().optional(),
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
});
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
