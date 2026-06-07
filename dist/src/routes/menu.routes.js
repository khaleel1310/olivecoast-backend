"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menu_controller_1 = require("../controllers/menu.controller");
const upload_service_1 = require("../services/upload.service");
const router = (0, express_1.Router)();
// Route mapping for Step 8: Publicly accessible menu fetch
router.get('/', menu_controller_1.MenuController.getMenu);
//  Admin/Owner Managed CRUD Endpoints
router.post('/', menu_controller_1.MenuController.createItem);
router.put('/:id', menu_controller_1.MenuController.updateItem);
router.delete('/:id', menu_controller_1.MenuController.deleteItem);
// 📸 Secure Image uploading pipeline for the owner
router.post('/upload', upload_service_1.uploadMiddleware.single('image'), menu_controller_1.MenuController.uploadImage);
exports.default = router;
