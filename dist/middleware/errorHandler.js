"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
// Not Found Handler
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
        },
    });
}
// Global Error Handler
function errorHandler(err, req, res, next) {
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
