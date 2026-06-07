"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuController = void 0;
const menu_service_1 = require("../services/menu.service");
const upload_service_1 = require("../services/upload.service");
class MenuController {
    // GET /api/menu
    static async getMenu(req, res, next) {
        try {
            const menu = await menu_service_1.MenuService.getPublicMenu();
            return res.status(200).json(menu);
        }
        catch (error) {
            next(error); // Passes any database or parsing errors down to our global error middleware
        }
    }
    static async createItem(req, res) {
        try {
            const { name, description, price, categoryId, image } = req.body;
            if (!name || !price || !categoryId) {
                return res.status(400).json({ error: 'Name, price, and categoryId are required.' });
            }
            // 🎯 FIXED: Map the destructured 'image' request string to the required 'imageUrl' service property
            const item = await menu_service_1.MenuService.createItem({
                name,
                description,
                price: String(price),
                categoryId,
                imageUrl: image
            });
            return res.status(201).json(item);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to create menu item.' });
        }
    }
    static async updateItem(req, res) {
        try {
            const { id } = req.params;
            const { name, description, price, categoryId, image } = req.body;
            // 🎯 FIXED: Map 'image' to 'imageUrl' here as well to satisfy the service type definitions!
            const item = await menu_service_1.MenuService.updateItem(id, {
                name,
                description,
                price: String(price),
                categoryId,
                imageUrl: image
            });
            return res.json(item);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to update menu item.' });
        }
    }
    static async deleteItem(req, res) {
        try {
            const { id } = req.params;
            await menu_service_1.MenuService.deleteItem(id);
            return res.json({ message: 'Menu item successfully deleted.' });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to delete menu item.' });
        }
    }
    // 📸 Cloudinary Media Stream Receiver Route Handler
    static async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided.' });
            }
            const secureUrl = await upload_service_1.UploadService.uploadImage(req.file);
            return res.json({ imageUrl: secureUrl });
        }
        catch (error) {
            console.error('Cloudinary upload failure:', error);
            return res.status(500).json({ error: 'Failed to upload asset to cloud media bucket.' });
        }
    }
}
exports.MenuController = MenuController;
