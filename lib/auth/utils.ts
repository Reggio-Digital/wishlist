import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Initialize secrets (auto-generate if not provided)
const secrets = initializeSecrets();

// Token expiry times
const TOKEN_EXPIRY = '72h';
const REFRESH_TOKEN_EXPIRY = '30d';

/**
 * Initialize JWT secrets - auto-generate and persist if not provided in environment
 */
function initializeSecrets(): { secret: string; refreshSecret: string } {
  const dataDir = path.join(process.cwd(), 'data');
  const secretsFile = path.join(dataDir, 'secrets.json');

  // If provided in environment, use those
  if (process.env.SECRET) {
    return {
      secret: process.env.SECRET,
      refreshSecret: process.env.REFRESH_SECRET || process.env.SECRET, // Use same secret if refresh not provided
    };
  }

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Try to load existing secrets
  if (fs.existsSync(secretsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(secretsFile, 'utf-8'));
      return data;
    } catch {
      // Failed to load, will generate new ones
    }
  }

  // Generate new cryptographically secure secrets (512 bits each)
  const newSecrets = {
    secret: crypto.randomBytes(64).toString('hex'),
    refreshSecret: crypto.randomBytes(64).toString('hex'),
  };

  // Save to file with restricted permissions
  try {
    fs.writeFileSync(secretsFile, JSON.stringify(newSecrets, null, 2), { mode: 0o600 });
  } catch (error) {
    console.error('⚠️  Failed to save secrets file:', error);
    console.error('⚠️  WARNING: Using in-memory secrets - tokens will be invalid after restart!');
  }

  return newSecrets;
}

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
    secrets.secret,
    { expiresIn: TOKEN_EXPIRY } as jwt.SignOptions
  );
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(username: string): string {
  return jwt.sign(
    { username, type: 'refresh' } as TokenPayload,
    secrets.refreshSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
  );
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, secrets.secret) as TokenPayload;
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
    const payload = jwt.verify(token, secrets.refreshSecret) as TokenPayload;
    if (payload.type !== 'refresh') {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
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

export function isSecureCookie(request: { headers: { get(name: string): string | null }; url: string }): boolean {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === 'true';
  }
  if (process.env.NODE_ENV === 'production') {
    return (
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://')
    );
  }
  return false;
}
