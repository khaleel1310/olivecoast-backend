import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface locally to handle our injected user payload safely
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'OWNER' | 'CHEF';
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Extract the token from the secure cookie we named 'token'
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No session token provided.' });
  }

  try {
    // 2. Verify the token signature against our environment secret key
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    const decoded = jwt.verify(token, secret) as { id: string; role: 'OWNER' | 'CHEF' };

    // 3. Attach the verified user details straight to the request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // 4. Pass the request down the pipeline to the controller
    return next();
  } catch (error) {
    // If token is expired or tampered with, clear the bad cookie immediately
    res.clearCookie('token');
    return res.status(401).json({ error: 'Session expired or invalid authentication.' });
  }
};