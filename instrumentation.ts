/**
 * Next.js Instrumentation Hook
 * This runs once when the Next.js server starts up
 * Perfect for initializing the database and seeding it with sample data
 */

export async function register() {
  // Only run in production/development runtime, not during build
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    const { initializeDatabase } = await import('./lib/db/index');
    await initializeDatabase();
  }
}
