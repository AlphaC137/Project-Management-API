"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_route_1 = __importDefault(require("./modules/health/health.route"));
// Import other module routers here as you build them
const router = (0, express_1.Router)();
router.use('/health', health_route_1.default);
// router.use('/users', usersRouter);
// router.use('/organizations', organizationsRouter);
// ... add more as you build
exports.default = router;
