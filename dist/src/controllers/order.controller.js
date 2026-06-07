"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
class OrderController {
    // POST /api/orders
    static async createOrder(req, res, next) {
        try {
            const { customerName, phoneNumber, deliveryAddress, notes, items } = req.body;
            const newOrder = await order_service_1.OrderService.createCustomerOrder({
                customerName,
                phoneNumber,
                deliveryAddress,
                notes,
                items
            });
            return res.status(201).json({
                message: 'Order placed successfully with the kitchen!',
                order: newOrder
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async getDashboardOrders(req, res, next) {
        try {
            // req.user is injected cleanly by our authMiddleware guard
            const userRole = req.user?.role;
            if (!userRole) {
                return res.status(403).json({ error: 'Unauthorized staff role signature.' });
            }
            const orders = await order_service_1.OrderService.getOrdersByRole(userRole);
            return res.status(200).json(orders);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/orders/:id
    static async completeOrder(req, res, next) {
        try {
            const { id } = req.params;
            const userRole = req.user?.role;
            // Role Check authorization safeguard
            if (userRole !== 'CHEF') {
                return res.status(403).json({
                    error: 'Access denied. Only CHEF staff profiles can complete order tickets.'
                });
            }
            const updatedOrder = await order_service_1.OrderService.markOrderAsCompleted(id);
            return res.status(200).json({
                message: `Order ${updatedOrder.orderNumber} successfully marked as COMPLETED.`,
                order: updatedOrder
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.OrderController = OrderController;
