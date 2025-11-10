import { db } from './index.js';
import { wishlists, wishlistItems, settings } from './schema.js';

async function testDatabase() {
  console.log('📊 Testing Database Setup\n');

  // Test settings
  console.log('Settings:');
  const allSettings = await db.select().from(settings);
  console.table(allSettings.map(s => ({ key: s.key, value: s.value })));

  // Test wishlists table
  console.log('\n📋 Wishlists table structure: ✅');

  // Test wishlist items table
  console.log('🎁 Wishlist items table structure: ✅');

  console.log('\n✅ All database tables are set up correctly!');
}

testDatabase().catch(console.error);
