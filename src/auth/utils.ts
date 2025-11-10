import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

// Token expiry times
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY_HOURS
  ? `${process.env.TOKEN_EXPIRY_HOURS}h`
  : '72h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY_DAYS
  ? `${process.env.REFRESH_TOKEN_EXPIRY_DAYS}d`
  : '30d';

export interface TokenPayload {
  username: string;
  type: 'access' | 'refresh';
}

/**
 * Generate an access token
 */
export function generateAccessToken(username: string): string {
  return jwt.sign(
    { username, type: 'access' } as TokenPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(username: string): string {
  return jwt.sign(
    { username, type: 'refresh' } as TokenPayload,
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (payload.type !== 'access') {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    if (payload.type !== 'refresh') {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate admin credentials against environment variables
 */
export function validateAdminCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD not set in environment variables');
    return false;
  }

  return username === adminUsername && password === adminPassword;
}
