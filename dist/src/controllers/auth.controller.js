"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthController {
    // POST /api/auth/login
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // 1. Basic validation inputs
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }
            // 2. Lookup user in database
            const user = await client_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            // 3. Verify the hashed password matching
            const isMatch = await bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            // 4. Generate the JWT Payload
            const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
            const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1d' } // Session valid for 24 hours
            );
            // 5. Append cookie to response stream
            res.cookie('token', token, {
                httpOnly: true, // Blocks client-side XSS script reading
                secure: true, // CRITICAL: Required for cross-domain Vercel -> Render
                sameSite: 'none', // CRITICAL: Allows the cookie to be sent across different domains
                maxAge: 24 * 60 * 60 * 1000 // FIXED: Coordinated to exactly 24 hours to match the JWT token lifespan
            });
            return res.status(200).json({
                message: 'Logged in successfully to Olive Coast Kitchen.',
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/auth/logout
    static async logout(req, res, next) {
        try {
            // Overwrite the cookie with an empty string and expire it immediately
            res.cookie('token', '', {
                httpOnly: true,
                secure: true, // FIXED: Must match login configurations exactly for cross-domain cleanup
                sameSite: 'none', // FIXED: Must match login configurations exactly for cross-domain cleanup
                expires: new Date(0) // Sets expiration date to 1970, instantly destroying the cookie
            });
            return res.status(200).json({
                message: 'Logged out successfully from Olive Coast Kitchen.'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
