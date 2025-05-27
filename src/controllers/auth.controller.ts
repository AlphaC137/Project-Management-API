import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import pool from '../config/database';
import { ApiError } from '../utils/ApiError';
import { generateTokens } from '../middleware/auth';
import { Redis } from 'ioredis';
import rateLimit from 'express-rate-limit';

const redis = new Redis(process.env.REDIS_URL);

// Rate limiting setup
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes'
});

export class AuthController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel(pool);
  }

  register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const user = await this.userModel.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      is_active: true
    });

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2);
    await redis.set(`verify:${verificationToken}`, user.id, 'EX', 24 * 60 * 60); // 24 hours expiry

    // TODO: Send verification email
    
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.'
    });
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValid = await this.userModel.validatePassword(user, password);
    if (!isValid) {
      // Increment failed login attempts
      const failedAttempts = await redis.incr(`login:${email}`);
      await redis.expire(`login:${email}`, 900); // 15 minutes

      if (failedAttempts >= 5) {
        throw new ApiError(429, 'Account temporarily locked. Please try again later');
      }

      throw new ApiError(401, 'Invalid credentials');
    }

    // Reset failed login attempts
    await redis.del(`login:${email}`);

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    // Store refresh token in Redis
    await redis.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      'EX',
      7 * 24 * 60 * 60 // 7 days
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      tokens
    });
  };

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token required');
    }

    const storedToken = await redis.get(`refresh:${req.user!.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const tokens = generateTokens(req.user!.id, req.user!.email);

    // Update refresh token in Redis
    await redis.set(
      `refresh:${req.user!.id}`,
      tokens.refreshToken,
      'EX',
      7 * 24 * 60 * 60
    );

    res.json({ tokens });
  };

  logout = async (req: Request, res: Response) => {
    // Remove refresh token from Redis
    await redis.del(`refresh:${req.user!.id}`);
    
    res.json({ message: 'Logged out successfully' });
  };
}
