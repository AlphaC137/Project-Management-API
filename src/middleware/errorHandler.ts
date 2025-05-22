import { Request, Response, NextFunction } from 'express';

// Not Found Handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
  });
}

// Global Error Handler
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error (could be enhanced with a logger)
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || undefined,
    },
  });
}
