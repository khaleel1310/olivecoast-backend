// 📁 backend/src/controllers/menu.controller.ts
import { Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service';
import { UploadService } from '../services/upload.service';

export class MenuController {
  // GET /api/menu
  static async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const menu = await MenuService.getPublicMenu();
      return res.status(200).json(menu);
    } catch (error) {
      next(error); // Passes any database or parsing errors down to our global error middleware
    }
  }

  static async createItem(req: Request, res: Response) {
    try {
      const { name, description, price, categoryId, image } = req.body;
      if (!name || !price || !categoryId) {
        return res.status(400).json({ error: 'Name, price, and categoryId are required.' });
      }

      // 🎯 FIXED: Map the destructured 'image' request string to the required 'imageUrl' service property
      const item = await MenuService.createItem({ 
        name, 
        description, 
        price: String(price), 
        categoryId, 
        imageUrl: image 
      });
      return res.status(201).json(item);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create menu item.' });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string }; 
      const { name, description, price, categoryId, image } = req.body;

      // 🎯 FIXED: Map 'image' to 'imageUrl' here as well to satisfy the service type definitions!
      const item = await MenuService.updateItem(id, { 
        name, 
        description, 
        price: String(price), 
        categoryId, 
        imageUrl: image 
      });
      return res.json(item);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update menu item.' });
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await MenuService.deleteItem(id);
      return res.json({ message: 'Menu item successfully deleted.' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete menu item.' });
    }
  }

  // 📸 Cloudinary Media Stream Receiver Route Handler
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided.' });
      }

      const secureUrl = await UploadService.uploadImage(req.file);
      return res.json({ imageUrl: secureUrl });
    } catch (error) {
      console.error('Cloudinary upload failure:', error);
      return res.status(500).json({ error: 'Failed to upload asset to cloud media bucket.' });
    }
  }
}