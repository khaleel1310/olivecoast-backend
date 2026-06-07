import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { uploadMiddleware } from '../services/upload.service';

const router = Router();

// Route mapping for Step 8: Publicly accessible menu fetch
router.get('/', MenuController.getMenu);


//  Admin/Owner Managed CRUD Endpoints
router.post('/', MenuController.createItem);
router.put('/:id', MenuController.updateItem);
router.delete('/:id', MenuController.deleteItem);
// 📸 Secure Image uploading pipeline for the owner
router.post('/upload', uploadMiddleware.single('image'), MenuController.uploadImage);


export default router;