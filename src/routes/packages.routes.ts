// 📁 src/routes/packages.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/packages.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ctrl.getPackages);           // public — customer page
router.get('/addons', ctrl.getAddons);       // public — customer page
router.get('/drinks', ctrl.getDrinks);       // public — customer page (NEW)
router.put('/:id', authMiddleware, ctrl.updatePackage);  // owner only

export default router;