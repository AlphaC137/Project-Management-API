import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { PasswordResetController, resetLimiter } from '../controllers/password-reset.controller';
import { auth } from '../middleware/auth';
import { asyncHandler } from '../utils/ApiError';

const router = Router();
const profileController = new ProfileController();
const passwordResetController = new PasswordResetController();

// Profile routes
router.get('/me', auth, asyncHandler(profileController.getProfile));
router.put('/me', auth, asyncHandler(profileController.updateProfile));
router.post('/me/avatar', auth, asyncHandler(profileController.uploadAvatar));
router.put('/me/password', auth, asyncHandler(profileController.changePassword));
router.post('/me/deactivate', auth, asyncHandler(profileController.deactivateAccount));

// Password reset routes
router.post('/password-reset', resetLimiter, asyncHandler(passwordResetController.requestReset));
router.post('/password-reset/confirm', resetLimiter, asyncHandler(passwordResetController.resetPassword));

export default router;
