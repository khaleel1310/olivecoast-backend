// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Route Imports
import authRoutes from './routes/auth.routes';
import packagesRoutes from './routes/packages.routes';
import bookingsRoutes from './routes/bookings.routes';

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
app.use('/api/packages', packagesRoutes);
app.use('/api/bookings', bookingsRoutes);

export default app;