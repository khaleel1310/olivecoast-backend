import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthController {
  // POST /api/auth/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // 1. Basic validation inputs
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // 2. Lookup user in database
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // 3. Verify the hashed password matching
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // 4. Generate the JWT Payload
      const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
      const token = jwt.sign(
        { id: user.id, role: user.role },
        secret,
        { expiresIn: '1d' } // Session valid for 24 hours
      );

      // 5. Append cookie to response stream
      res.cookie('token', token, {
        httpOnly: true,                                      // Blocks client-side XSS script reading
        secure: process.env.NODE_ENV === 'production',       // Forces HTTPS transmission on production
        sameSite: 'lax',                                     // Protects against CSRF context tampering
        maxAge: 24 * 60 * 60 * 1000                          // 1 day duration in milliseconds
      });

      return res.status(200).json({
        message: 'Logged in successfully to Olive Coast Kitchen.',
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
  // POST /api/auth/logout
static async logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Overwrite the cookie with an empty string and expire it immediately
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0) // Sets expiration date to 1970, instantly destroying the cookie
    });

    return res.status(200).json({
      message: 'Logged out successfully from Olive Coast Kitchen.'
    });
  } catch (error) {
    next(error);
  }
}
}