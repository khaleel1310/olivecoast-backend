"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const menu_routes_1 = __importDefault(require("./routes/menu.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const app = (0, express_1.default)();
// 1. Global Security & Utility Middleware
app.use((0, helmet_1.default)()); // Protects headers
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Matches Vite's default port
    credentials: true // Crucial for accepting the secure JWT cookie
}));
app.use(express_1.default.json()); // Parses incoming JSON request bodies
app.use((0, cookie_parser_1.default)()); // Parses HTTP-only cookies securely
// 2. Base Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', restaurant: 'Olive Coast Mediterranean Kitchen' });
});
// 3. Register Application Routes
app.use('/api/auth', auth_routes_1.default); // Sets up /api/auth/login and /api/auth/logout
app.use('/api/menu', menu_routes_1.default); // Sets up /api/menu
app.use('/api/orders', order_routes_1.default); // <-- Mount /api/orders path here
exports.default = app;
