import { successResponse } from '../../shared/responses/apiResponse.js';
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register = async (req, res) => {
        const user = await this.authService.register(req.body);
        res.status(201).json(successResponse('User registered successfully. Please check your email to verify your account.', user));
    };
    verifyEmail = async (req, res) => {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json(successResponse('Token is required'));
        }
        await this.authService.verifyEmail(token);
        res.status(200).json(successResponse('Email verified successfully. You can now log in.'));
    };
    login = async (req, res) => {
        const authData = await this.authService.login(req.body);
        res.status(200).json(successResponse('Login successful', authData));
    };
    refreshToken = async (req, res) => {
        const tokenData = await this.authService.refreshToken(req.body);
        res.status(200).json(successResponse('Token refreshed', tokenData));
    };
    logout = async (req, res) => {
        await this.authService.logout(req.body);
        res.status(200).json(successResponse('Logged out successfully'));
    };
    forgotPassword = async (req, res) => {
        await this.authService.forgotPassword(req.body);
        res.status(200).json(successResponse('If the email exists, a reset link has been sent.'));
    };
    resetPassword = async (req, res) => {
        await this.authService.resetPassword(req.body);
        res.status(200).json(successResponse('Password reset successfully. You can now log in.'));
    };
    updateProfile = async (req, res) => {
        const userId = req.user.id;
        const updatedUser = await this.authService.updateProfile(userId, req.body);
        res.status(200).json(successResponse('Profile updated successfully', updatedUser));
    };
}
