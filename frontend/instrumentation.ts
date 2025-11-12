/**
 * Next.js Instrumentation Hook
 * This runs once when the Next.js server starts up
 * Perfect for initializing the database and seeding it with sample data
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDatabase } = await import('./lib/db/index');
    await initializeDatabase();
  }
}
