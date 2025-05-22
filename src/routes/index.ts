import { Router } from 'express';
import healthRouter from './modules/health/health.route';
// Import other module routers here as you build them

const router = Router();

router.use('/health', healthRouter);
// router.use('/users', usersRouter);
// router.use('/organizations', organizationsRouter);
// ... add more as you build

export default router;
