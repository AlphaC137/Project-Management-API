"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
// Utility for standardized API responses
function successResponse(data, message = 'Operation completed successfully', pagination) {
    return {
        success: true,
        data,
        message,
        ...(pagination ? { pagination } : {}),
    };
}
function errorResponse(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    };
}
