"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Simple health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is healthy',
    });
});
exports.default = router;
