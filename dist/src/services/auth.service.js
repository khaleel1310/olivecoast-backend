"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    static async validateUserCredentials(email, password) {
        // Look up the user by email (Change 'user' to your exact schema model name if different)
        const user = await client_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            const error = new Error('Invalid email or password configuration.');
            error.status = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }
        // Compare raw password with the secure hashed password (verify your schema column name, e.g., password or passwordHash)
        const isPasswordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            const error = new Error('Invalid email or password configuration.');
            error.status = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
}
exports.AuthService = AuthService;
