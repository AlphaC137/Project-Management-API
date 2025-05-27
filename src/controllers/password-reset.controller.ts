import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import pool from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Redis } from 'ioredis';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const redis = new Redis(process.env.REDIS_URL);

// Rate limiting for password reset requests
export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts, please try again later'
});

export class PasswordResetController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel(pool);
  }

  requestReset = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await this.userModel.findByEmail(email);
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token in Redis with 1-hour expiry
    await redis.set(
      `reset:${hashedToken}`,
      user.id,
      'EX',
      60 * 60 // 1 hour
    );

    // TODO: Send password reset email with token
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    res.json({
      message: 'If an account exists with this email, a password reset link will be sent.'
    });
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ApiError(400, 'Token and new password are required');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redis.get(`reset:${hashedToken}`);

    if (!userId) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update password and remove reset token
    await this.userModel.updatePassword(user.id, password);
    await redis.del(`reset:${hashedToken}`);

    // Invalidate all existing sessions
    const sessionPattern = `refresh:${user.id}:*`;
    const sessionKeys = await redis.keys(sessionPattern);
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys);
    }

    res.json({ message: 'Password reset successful' });
  };
}
