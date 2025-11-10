import { Router, Request, Response } from 'express';
import {
  generateAccessToken,
  generateRefreshToken,
  validateAdminCredentials,
  verifyRefreshToken,
} from './utils.js';
import { authenticate } from './middleware.js';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate admin user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Validate credentials
    if (!validateAdminCredentials(username, password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(username);
    const refreshToken = generateRefreshToken(username);

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 72 * 60 * 60 * 1000, // 72 hours (default)
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (default)
    });

    res.json({
      success: true,
      user: { username },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user by clearing tokens
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie or body
    let refreshToken: string | undefined;

    if (req.cookies && req.cookies.refresh_token) {
      refreshToken = req.cookies.refresh_token;
    } else if (req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload.username);
    const newRefreshToken = generateRefreshToken(payload.username);

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (authenticated)
 */
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * PATCH /api/auth/password
 * Change admin password (authenticated)
 */
router.patch('/password', authenticate, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    // Validate current password
    if (!validateAdminCredentials(req.user!.username, currentPassword)) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // In a real implementation, you would update the password in a database
    // For now, we just return a message since password is in .env
    res.status(501).json({
      error: 'Password change not implemented. Please update ADMIN_PASSWORD in .env file.',
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

export default router;
