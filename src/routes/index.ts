import { Router } from 'express';
import healthRouter from '../modules/health/health.route';
import authRouter from '../modules/auth/auth.route';
// Import other module routers here as you build them

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
// router.use('/users', usersRouter);
// router.use('/organizations', organizationsRouter);
// ... add more as you build

export default router;
