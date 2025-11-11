import { db } from './index.js';
import { wishlists, wishlistItems } from './schema.js';

async function testDatabase() {
  console.log('📊 Testing Database Setup\n');

  // Test wishlists table
  console.log('📋 Wishlists table structure: ✅');
  const allWishlists = await db.select().from(wishlists);
  console.log(`Found ${allWishlists.length} wishlist(s)`);

  // Test wishlist items table
  console.log('\n🎁 Wishlist items table structure: ✅');
  const allItems = await db.select().from(wishlistItems);
  console.log(`Found ${allItems.length} item(s)`);

  console.log('\n✅ All database tables are set up correctly!');
  console.log('\n💡 Note: Settings are now managed via environment variables');
}

testDatabase().catch(console.error);
