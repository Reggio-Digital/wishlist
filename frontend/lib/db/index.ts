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

// Initialize database (run migrations and seed if needed)
export async function initializeDatabase() {
  try {
    const migrationsFolder = path.join(process.cwd(), 'drizzle');

    // Only run migrations if the folder exists
    if (fs.existsSync(migrationsFolder)) {
      migrate(db, { migrationsFolder });
      console.log('✅ Database migrations completed');
    } else {
      console.log('⚠️  No migrations folder found - skipping migrations');
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
