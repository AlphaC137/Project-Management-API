// Utility for standardized API responses
export function successResponse<T>(data: T, message = 'Operation completed successfully', pagination?: any) {
  return {
    success: true,
    data,
    message,
    ...(pagination ? { pagination } : {}),
  };
}

export function errorResponse(code: string, message: string, details?: any) {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
