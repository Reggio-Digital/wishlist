import { db } from './index';
import { wishlists, wishlistItems } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Seed the database with sample data
 * This creates example wishlists and items to help users get started
 */
export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingWishlists = await db.select().from(wishlists).limit(1);
    if (existingWishlists.length > 0) {
      return;
    }

    // Create sample wishlists
    const [dadWishlist] = await db.insert(wishlists).values({
      name: "Dad's Wishlist",
      slug: 'dads-wishlist',
      description: 'Birthday and holiday gift ideas',
      isPublic: true,
    }).returning();

    const [momWishlist] = await db.insert(wishlists).values({
      name: "Mom's Wishlist",
      slug: 'moms-wishlist',
      description: 'Things I would love!',
      isPublic: true,
    }).returning();

    // Create sample items for Dad's wishlist
    await db.insert(wishlistItems).values([
      {
        wishlistId: dadWishlist.id,
        name: 'Wireless Headphones',
        description: 'Noise-canceling headphones for the commute',
        price: 249.99,
        currency: 'USD',
        quantity: 1,
        sortOrder: 0,
        imageUrl: '/images/test.jpg',
        purchaseUrls: [
          { label: 'Amazon - $249.99', url: 'https://amazon.com', isPrimary: true },
          { label: 'Best Buy - $269.99', url: 'https://bestbuy.com', isPrimary: false },
          { label: 'Target - $259.99', url: 'https://target.com', isPrimary: false },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Coffee Maker',
        description: 'Programmable drip coffee maker with thermal carafe',
        price: 89.99,
        currency: 'USD',
        quantity: 1,
        sortOrder: 1,
        imageUrl: '/images/test.jpg',
        purchaseUrls: [
          { label: 'Amazon - $89.99', url: 'https://amazon.com', isPrimary: true },
          { label: 'Walmart - $84.99', url: 'https://walmart.com', isPrimary: false },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Running Shoes',
        description: 'Size 10.5, prefer neutral cushioning',
        price: 120.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 2,
        purchaseUrls: [
          { label: 'Nike Store - $120.00', url: 'https://nike.com', isPrimary: true },
          { label: 'Amazon - $115.00', url: 'https://amazon.com', isPrimary: false },
          { label: 'Foot Locker - $129.99', url: 'https://footlocker.com', isPrimary: false },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Book: "Project Hail Mary"',
        description: 'Sci-fi novel by Andy Weir',
        price: 16.99,
        currency: 'USD',
        quantity: 1,
        sortOrder: 3,
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 45.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 4,
      },
    ]);

    // Create sample items for Mom's wishlist
    await db.insert(wishlistItems).values([
      {
        wishlistId: momWishlist.id,
        name: 'Stand Mixer',
        description: 'KitchenAid or similar, prefer pastel colors',
        price: 379.99,
        currency: 'USD',
        quantity: 1,
        sortOrder: 0,
        imageUrl: '/images/test.jpg',
        purchaseUrls: [
          { label: 'Amazon - $379.99', url: 'https://amazon.com', isPrimary: true },
          { label: 'Williams Sonoma - $399.99', url: 'https://williams-sonoma.com', isPrimary: false },
          { label: 'Target - $369.99', url: 'https://target.com', isPrimary: false },
        ],
      },
      {
        wishlistId: momWishlist.id,
        name: 'Yoga Mat',
        description: 'Extra thick (6mm+) with carrying strap',
        price: 45.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 1,
        purchaseUrls: [
          { label: 'Lululemon - $45.00', url: 'https://lululemon.com', isPrimary: true },
          { label: 'Amazon - $39.99', url: 'https://amazon.com', isPrimary: false },
        ],
      },
      {
        wishlistId: momWishlist.id,
        name: 'Gardening Tools Set',
        description: 'Hand trowel, pruners, and weeder',
        price: 35.99,
        currency: 'USD',
        quantity: 1,
        sortOrder: 2,
      },
      {
        wishlistId: momWishlist.id,
        name: 'Spa Day Gift Card',
        description: 'Any amount - for massage or facial',
        quantity: 1,
        sortOrder: 3,
      },
      {
        wishlistId: momWishlist.id,
        name: 'Cookbook: Mediterranean Recipes',
        description: 'Healthy and delicious recipes',
        price: 28.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 4,
      },
    ]);

    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
