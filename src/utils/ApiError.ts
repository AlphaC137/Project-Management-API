import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Example usage: throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid input', { field: 'email' });

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
