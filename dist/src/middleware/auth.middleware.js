"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // 1. Extract the token from the secure cookie we named 'token'
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No session token provided.' });
    }
    try {
        // 2. Verify the token signature against our environment secret key
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // 3. Attach the verified user details straight to the request object
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        // 4. Pass the request down the pipeline to the controller
        return next();
    }
    catch (error) {
        // If token is expired or tampered with, clear the bad cookie immediately
        res.clearCookie('token');
        return res.status(401).json({ error: 'Session expired or invalid authentication.' });
    }
};
exports.authMiddleware = authMiddleware;
