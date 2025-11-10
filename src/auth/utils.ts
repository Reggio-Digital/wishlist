import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Initialize secrets (auto-generate if not provided)
const secrets = initializeSecrets();

// Token expiry times
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY_HOURS
  ? `${process.env.TOKEN_EXPIRY_HOURS}h`
  : '72h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY_DAYS
  ? `${process.env.REFRESH_TOKEN_EXPIRY_DAYS}d`
  : '30d';

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
      console.log('✅ Loaded existing JWT secrets from file');
      return data;
    } catch (error) {
      console.warn('⚠️  Failed to load secrets file, generating new ones');
    }
  }

  // Generate new secrets
  const newSecrets = {
    secret: crypto.randomBytes(64).toString('hex'),
    refreshSecret: crypto.randomBytes(64).toString('hex'),
  };

  // Save to file
  try {
    fs.writeFileSync(secretsFile, JSON.stringify(newSecrets, null, 2));
    console.log('✅ Generated and saved new JWT secrets');
  } catch (error) {
    console.error('⚠️  Failed to save secrets file:', error);
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
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(username: string): string {
  return jwt.sign(
    { username, type: 'refresh' } as TokenPayload,
    secrets.refreshSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
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
