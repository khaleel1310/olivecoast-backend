// src/routes/bookings.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/bookings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', ctrl.createBooking);                    // public
router.get('/', authMiddleware, ctrl.getBookings);      // owner/chef
router.get('/:id', authMiddleware, ctrl.getBooking);      // owner/chef

// Wrap updateStatus to match Express RequestHandler signature
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    const updated = await ctrl.updateStatus(id, status);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/number/:num', authMiddleware, ctrl.getByNumber); // tracking

export default router;