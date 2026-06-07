import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Route mapping for Step 6
router.post('/login', AuthController.login);

// Route mapping for Step 7
router.post('/logout', AuthController.logout);

export default router;