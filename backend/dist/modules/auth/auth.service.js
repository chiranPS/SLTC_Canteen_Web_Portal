import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.config.js';
import { AppError } from '../../shared/errors/AppError.js';
export class AuthService {
    authRepo;
    emailService;
    constructor(authRepo, emailService) {
        this.authRepo = authRepo;
        this.emailService = emailService;
    }
    generateTokenString() {
        return crypto.randomBytes(32).toString('hex');
    }
    async register(data) {
        const existingUser = await this.authRepo.findUserByEmailOrUniversityId(data.email, data.universityId);
        if (existingUser) {
            throw new AppError('User with this email or university ID already exists', 400, 'USER_EXISTS');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const newUser = await this.authRepo.createUser({
            name: data.name,
            email: data.email,
            universityId: data.universityId,
            passwordHash,
        });
        // Generate Verification Token
        const tokenStr = this.generateTokenString();
        await this.authRepo.createToken({
            token: tokenStr,
            type: 'VERIFY_EMAIL',
            userId: newUser.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
        await this.emailService.sendVerificationEmail(newUser.email, tokenStr);
        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        };
    }
    async verifyEmail(token) {
        const tokenRecord = await this.authRepo.findToken(token, 'VERIFY_EMAIL');
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
        }
        await this.authRepo.updateUser(tokenRecord.userId, { isEmailVerified: true });
        await this.authRepo.deleteToken(token);
    }
    async login(data) {
        const user = await this.authRepo.findUserByEmail(data.email);
        if (!user) {
            throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        // TODO: Re-enable email verification after testing phase
        // if (!user.isEmailVerified) {
        //   throw new AppError('Please verify your email before logging in', 403, 'EMAIL_NOT_VERIFIED');
        // }
        const accessToken = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
        // Generate Refresh Token
        const refreshToken = this.generateTokenString();
        await this.authRepo.createToken({
            token: refreshToken,
            type: 'REFRESH',
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                universityId: user.universityId,
                phoneNumber: user.phoneNumber,
                nic: user.nic,
                address: user.address,
            }
        };
    }
    async refreshToken(data) {
        const tokenRecord = await this.authRepo.findToken(data.refreshToken, 'REFRESH');
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            if (tokenRecord)
                await this.authRepo.deleteToken(data.refreshToken);
            throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
        }
        const user = tokenRecord.user;
        const accessToken = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
        // Rotate refresh token
        const newRefreshToken = this.generateTokenString();
        await this.authRepo.deleteToken(data.refreshToken);
        await this.authRepo.createToken({
            token: newRefreshToken,
            type: 'REFRESH',
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(data) {
        await this.authRepo.deleteToken(data.refreshToken);
    }
    async forgotPassword(data) {
        const user = await this.authRepo.findUserByEmail(data.email);
        if (!user) {
            // Do not leak if user exists
            return;
        }
        // Clear old reset tokens
        await this.authRepo.deleteAllTokensForUser(user.id, 'RESET_PASSWORD');
        const resetToken = this.generateTokenString();
        await this.authRepo.createToken({
            token: resetToken,
            type: 'RESET_PASSWORD',
            userId: user.id,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        });
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    async resetPassword(data) {
        const tokenRecord = await this.authRepo.findToken(data.token, 'RESET_PASSWORD');
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
        }
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(data.newPassword, salt);
        await this.authRepo.updateUser(tokenRecord.userId, { passwordHash: newPasswordHash });
        await this.authRepo.deleteAllTokensForUser(tokenRecord.userId, 'RESET_PASSWORD');
        // Also invalidate all active refresh tokens for security
        await this.authRepo.deleteAllTokensForUser(tokenRecord.userId, 'REFRESH');
    }
    async updateProfile(userId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.universityId !== undefined)
            updateData.universityId = data.universityId;
        if (data.phoneNumber !== undefined)
            updateData.phoneNumber = data.phoneNumber;
        if (data.nic !== undefined)
            updateData.nic = data.nic;
        if (data.address !== undefined)
            updateData.address = data.address;
        const updatedUser = await this.authRepo.updateUser(userId, updateData);
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            universityId: updatedUser.universityId,
            role: updatedUser.role,
            phoneNumber: updatedUser.phoneNumber,
            nic: updatedUser.nic,
            address: updatedUser.address,
        };
    }
}
