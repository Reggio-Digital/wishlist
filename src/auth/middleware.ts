import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './utils.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Checks for token in Authorization header or cookies
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header or cookies
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user to request
    req.user = { username: payload.username };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional middleware to check for global access password
 */
export function checkAccessPassword(req: Request, res: Response, next: NextFunction) {
  const accessPassword = process.env.ACCESS_PASSWORD;

  // If no access password is set, allow access
  if (!accessPassword) {
    next();
    return;
  }

  // Check if user has already authenticated with access password (stored in session/cookie)
  if (req.cookies && req.cookies.access_granted === 'true') {
    next();
    return;
  }

  // Check if password is provided in request
  const providedPassword = req.headers['x-access-password'] as string;
  if (providedPassword === accessPassword) {
    // Set cookie to remember access
    res.cookie('access_granted', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    next();
    return;
  }

  res.status(403).json({ error: 'Access password required' });
}
