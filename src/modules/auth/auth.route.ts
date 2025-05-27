import { Router } from 'express';
import { AuthController, loginLimiter } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';
import { asyncHandler } from '../utils/ApiError';

const router = Router();
const authController = new AuthController();

router.post('/register', asyncHandler(authController.register));
router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/refresh-token', auth, asyncHandler(authController.refreshToken));
router.post('/logout', auth, asyncHandler(authController.logout));

export default router;
