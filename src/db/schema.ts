import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

// Wishlists table
export const wishlists = sqliteTable('wishlists', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  notes: text('notes'), // Private admin-only notes
  coverImageType: text('cover_image_type', { enum: ['upload', 'url'] }),
  coverImageUrl: text('cover_image_url'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Wishlist items table
export const wishlistItems = sqliteTable('wishlist_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  wishlistId: text('wishlist_id').notNull().references(() => wishlists.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price'),
  currency: text('currency').notNull().default('USD'),
  quantity: integer('quantity').notNull().default(1),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),

  // Store as JSON arrays
  images: text('images', { mode: 'json' }).$type<Array<{
    type: 'upload' | 'url';
    url: string;
    isPrimary: boolean;
    order: number;
  }>>(),

  purchaseUrls: text('purchase_urls', { mode: 'json' }).$type<Array<{
    label: string;
    url: string;
    isPrimary: boolean;
    wasUsedForPurchase: boolean;
  }>>(),

  notes: text('notes'), // Private admin-only notes
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),

  // Claim information
  claimedByName: text('claimed_by_name'),
  claimedByNote: text('claimed_by_note'),
  claimedByToken: text('claimed_by_token').unique(),
  claimedAt: integer('claimed_at', { mode: 'timestamp' }),
  isPurchased: integer('is_purchased', { mode: 'boolean' }).notNull().default(false),

  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Settings table (key-value store)
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // Store as JSON
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Type exports
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
