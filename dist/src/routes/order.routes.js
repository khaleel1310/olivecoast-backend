"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Route mapping for Step 9: Public intake for incoming order placement
router.post('/', order_controller_1.OrderController.createOrder);
// Route mapping for Step 10: Protected staff dashboard access
router.get('/', auth_middleware_1.authMiddleware, order_controller_1.OrderController.getDashboardOrders);
// Route mapping for Step 11: Protected chef action to resolve a ticket
router.put('/:id', auth_middleware_1.authMiddleware, order_controller_1.OrderController.completeOrder);
exports.default = router;
