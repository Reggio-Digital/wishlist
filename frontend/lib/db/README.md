# Database Setup and Seeding

This directory contains the database schema, initialization, and seeding scripts for the Wishlist App.

## Automatic Setup

When you first start the app, the database is automatically:
1. **Created** - SQLite database file is created at `/data/wishlist.db`
2. **Migrated** - All schema migrations are applied
3. **Seeded** - Sample data is added (only if database is empty)

The sample data includes:
- **Dad's Wishlist** - 5 example items (tech and hobby items)
- **Mom's Wishlist** - 5 example items (home and wellness items)

All wishlists are set to public so you can immediately see them in action!

## Manual Seeding

If you want to manually seed the database later:

```bash
npm run db:seed
```

Note: The seed script will only run if the database is empty (no existing wishlists).

## Database Files

- **`schema.ts`** - Database schema definition using Drizzle ORM
- **`index.ts`** - Database connection and initialization
- **`seed.ts`** - Sample data seeding script
- **`test-db.ts`** - Database validation script

## Database Location

The SQLite database file is stored at:
```
/data/wishlist.db
```

## Drizzle Studio

To visually explore and edit your database:

```bash
npm run db:studio
```

This will open Drizzle Studio in your browser where you can view and edit all your wishlists and items.

## Creating Your Own Data

After seeding (or instead of seeding), you can:

1. **Via Admin UI**: Log in at `/admin/login` and create wishlists through the admin dashboard
2. **Via API**: Use the REST API endpoints to programmatically create data
3. **Via Drizzle Studio**: Use `npm run db:studio` to manually add data

## Resetting the Database

To start fresh:

1. Stop the application
2. Delete the database file: `rm data/wishlist.db`
3. Restart the app (migrations will run automatically)
4. Optionally run `npm run db:seed` again

## Notes

- The seed script will only run if the database is empty (no existing wishlists)
- Sample data includes realistic examples to help you understand the app's features
- All sample URLs are placeholders - update them with real product links as needed
