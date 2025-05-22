import { Router, Request, Response } from 'express';

const router = Router();

// Simple health check endpoint
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
  });
});

export default router;
