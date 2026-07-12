import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const user = await this.authService.register(req.body);
    res.status(201).json(
      successResponse('User registered successfully. Please check your email to verify your account.', user)
    );
  };

  verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json(successResponse('Token is required'));
    }
    await this.authService.verifyEmail(token);
    res.status(200).json(successResponse('Email verified successfully. You can now log in.'));
  };

  login = async (req: Request, res: Response) => {
    const authData = await this.authService.login(req.body);
    res.status(200).json(successResponse('Login successful', authData));
  };

  refreshToken = async (req: Request, res: Response) => {
    const tokenData = await this.authService.refreshToken(req.body);
    res.status(200).json(successResponse('Token refreshed', tokenData));
  };

  logout = async (req: Request, res: Response) => {
    await this.authService.logout(req.body);
    res.status(200).json(successResponse('Logged out successfully'));
  };

  forgotPassword = async (req: Request, res: Response) => {
    await this.authService.forgotPassword(req.body);
    res.status(200).json(successResponse('If the email exists, a reset link has been sent.'));
  };

  resetPassword = async (req: Request, res: Response) => {
    await this.authService.resetPassword(req.body);
    res.status(200).json(successResponse('Password reset successfully. You can now log in.'));
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const updatedUser = await this.authService.updateProfile(userId, req.body);
    res.status(200).json(successResponse('Profile updated successfully', updatedUser));
  };
}
