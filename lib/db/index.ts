import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Lazy initialization to avoid database access during build
let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;

function getDb() {
  if (!_db) {
    // Ensure data directories exist
    const dataDir = path.join(process.cwd(), 'data');
    const dbDir = path.join(dataDir, 'db');
    const uploadsDir = path.join(dataDir, 'uploads');

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Database file path
    const dbPath = path.join(dbDir, 'wishlist.db');

    // Create SQLite database connection
    _sqlite = new Database(dbPath);
    _sqlite.pragma('journal_mode = WAL'); // Better concurrency

    // Create Drizzle instance
    _db = drizzle(_sqlite, { schema });
  }
  return _db;
}

// Export db as a getter
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});

// Initialize database (create tables and seed if needed)
export async function initializeDatabase() {
  try {
    // Ensure database is initialized
    const sqlite = _sqlite || getDb() && _sqlite;
    if (!sqlite) throw new Error('Failed to initialize database');

    // Create wishlists table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
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

    // Create settings table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);

    // Run migrations for existing databases
    try {
      // Add image_url column if it doesn't exist
      const columns = sqlite.pragma('table_info(wishlists)') as Array<{ name: string }>;
      const hasImageUrl = columns.some((col) => col.name === 'image_url');
      if (!hasImageUrl) {
        sqlite.exec('ALTER TABLE wishlists ADD COLUMN image_url TEXT');
        console.log('✅ Added image_url column to wishlists table');
      }
    } catch (migrationError) {
      console.log('Migration already applied or not needed');
    }

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
