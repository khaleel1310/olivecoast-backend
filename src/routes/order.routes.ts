import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router();

// Route mapping for Step 9: Public intake for incoming order placement
router.post('/', OrderController.createOrder);

// Route mapping for Step 10: Protected staff dashboard access
router.get('/', authMiddleware as any, OrderController.getDashboardOrders);

// Route mapping for Step 11: Protected chef action to resolve a ticket
router.put('/:id', authMiddleware as any, OrderController.completeOrder);
export default router;