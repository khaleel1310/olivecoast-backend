import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';

const app = express();

// 1. Global Security & Utility Middleware
app.use(helmet()); // Protects headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Matches Vite's default port
  credentials: true // Crucial for accepting the secure JWT cookie
}));
app.use(express.json()); // Parses incoming JSON request bodies
app.use(cookieParser()); // Parses HTTP-only cookies securely

// 2. Base Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', restaurant: 'Olive Coast Mediterranean Kitchen' });
});

// 3. Register Application Routes
app.use('/api/auth', authRoutes); // Sets up /api/auth/login and /api/auth/logout
app.use('/api/menu', menuRoutes); // Sets up /api/menu
app.use('/api/orders', orderRoutes); // <-- Mount /api/orders path here
export default app;