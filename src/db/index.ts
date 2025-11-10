import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
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

// Initialize database (run migrations)
export function initializeDatabase() {
  try {
    const migrationsFolder = path.join(process.cwd(), 'drizzle');

    // Only run migrations if the folder exists
    if (fs.existsSync(migrationsFolder)) {
      migrate(db, { migrationsFolder });
      console.log('✅ Database migrations completed');
    } else {
      console.log('⚠️  No migrations folder found - skipping migrations');
    }

    // Initialize default settings if they don't exist
    initializeDefaultSettings();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Initialize default settings
function initializeDefaultSettings() {
  const defaultSettings = [
    { key: 'default_currency', value: JSON.stringify('USD') },
    { key: 'timezone', value: JSON.stringify('America/New_York') },
    { key: 'theme_toggle_enabled', value: JSON.stringify(true) },
    { key: 'default_theme', value: JSON.stringify('auto') },
    { key: 'accent_color', value: JSON.stringify('#3b82f6') },
    { key: 'date_format', value: JSON.stringify('MM/DD/YYYY') },
    { key: 'time_format', value: JSON.stringify('12h') },
    { key: 'block_search_engines', value: JSON.stringify(false) },
    { key: 'block_ai_crawlers', value: JSON.stringify(false) },
  ];

  const stmt = sqlite.prepare(`
    INSERT OR IGNORE INTO settings (key, value, updated_at)
    VALUES (?, ?, unixepoch())
  `);

  for (const setting of defaultSettings) {
    stmt.run(setting.key, setting.value);
  }

  console.log('✅ Default settings initialized');
}

// Export schema for use in other files
export * from './schema';
