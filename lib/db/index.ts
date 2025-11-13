import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'wishlist.db');

// Create SQLite database connection
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL'); // Better concurrency

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database (create tables and seed if needed)
export async function initializeDatabase() {
  try {
    // Create tables directly from schema
    const { wishlists, wishlistItems } = schema;

    // Create wishlists table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        notes TEXT,
        is_public INTEGER DEFAULT 0 NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);

    // Create wishlist_items table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id TEXT PRIMARY KEY NOT NULL,
        wishlist_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        currency TEXT DEFAULT 'USD' NOT NULL,
        quantity INTEGER DEFAULT 1 NOT NULL,
        images TEXT,
        purchase_urls TEXT,
        notes TEXT,
        is_archived INTEGER DEFAULT 0 NOT NULL,
        claimed_by_name TEXT,
        claimed_by_note TEXT,
        claimed_by_token TEXT UNIQUE,
        claimed_at INTEGER,
        is_purchased INTEGER DEFAULT 0 NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
      )
    `);

    // Auto-seed database if empty
    const { seedDatabase } = await import('./seed');
    await seedDatabase();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Export schema for use in other files
export * from './schema';
