import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import pool from '../config/database';
import { ApiError } from '../utils/ApiError';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const storage = multer.diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  }
});

export class ProfileController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel(pool);
  }

  getProfile = async (req: Request, res: Response) => {
    const user = await this.userModel.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  };

  updateProfile = async (req: Request, res: Response) => {
    const { firstName, lastName, phone, timezone, language } = req.body;
    const user = await this.userModel.update(req.user!.id, {
      first_name: firstName,
      last_name: lastName,
      phone,
      timezone,
      language
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  };

  uploadAvatar = async (req: Request, res: Response) => {
    upload.single('avatar')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        throw new ApiError(400, 'File upload error: ' + err.message);
      } else if (err) {
        throw new ApiError(400, err.message);
      }

      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const user = await this.userModel.update(req.user!.id, {
        avatar_url: `/uploads/avatars/${req.file.filename}`
      });

      // If user had a previous avatar, delete it
      if (user.avatar_url && user.avatar_url !== '/uploads/avatars/default.png') {
        try {
          await fs.unlink(path.join(__dirname, '../../', user.avatar_url));
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }

      res.json({ avatar_url: user.avatar_url });
    });
  };

  changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await this.userModel.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isValid = await this.userModel.validatePassword(user, currentPassword);
    if (!isValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    await this.userModel.updatePassword(user.id, newPassword);

    res.json({ message: 'Password updated successfully' });
  };

  deactivateAccount = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await this.userModel.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isValid = await this.userModel.validatePassword(user, password);
    if (!isValid) {
      throw new ApiError(401, 'Password is incorrect');
    }

    await this.userModel.update(user.id, { is_active: false });

    res.json({ message: 'Account deactivated successfully' });
  };
}
