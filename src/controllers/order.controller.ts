import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  // POST /api/orders
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerName, phoneNumber, deliveryAddress, notes, items } = req.body;
      
      const newOrder = await OrderService.createCustomerOrder({
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
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  static async getDashboardOrders(req: any, res: Response, next: NextFunction) {
    try {
      // req.user is injected cleanly by our authMiddleware guard
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ error: 'Unauthorized staff role signature.' });
      }

      const orders = await OrderService.getOrdersByRole(userRole);
      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }
  // PUT /api/orders/:id
  static async completeOrder(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;

      // Role Check authorization safeguard
      if (userRole !== 'CHEF') {
        return res.status(403).json({ 
          error: 'Access denied. Only CHEF staff profiles can complete order tickets.' 
        });
      }

      const updatedOrder = await OrderService.markOrderAsCompleted(id);
      
      return res.status(200).json({
        message: `Order ${updatedOrder.orderNumber} successfully marked as COMPLETED.`,
        order: updatedOrder
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}