// src/routes/bookings.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/bookings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/',              ctrl.createBooking);                    // public
router.get('/',               authMiddleware, ctrl.getBookings);      // owner/chef
router.get('/:id',            authMiddleware, ctrl.getBooking);       // owner/chef
router.put('/:id/status',     authMiddleware, ctrl.updateStatus);     // owner/chef
router.get('/number/:num',    authMiddleware, ctrl.getByNumber);      // tracking

export default router;