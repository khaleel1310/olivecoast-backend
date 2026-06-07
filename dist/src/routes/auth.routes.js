"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Route mapping for Step 6
router.post('/login', auth_controller_1.AuthController.login);
// Route mapping for Step 7
router.post('/logout', auth_controller_1.AuthController.logout);
exports.default = router;
