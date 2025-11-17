import { db } from './index';
import { wishlists, wishlistItems, settings } from './schema';
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

    // Seed settings
    await db.insert(settings).values([
      {
        key: 'siteTitle',
        value: 'Wishlist',
      },
      {
        key: 'homepageSubtext',
        value: 'Hello! Thank you so much for thinking of us! When you purchase something from our list, just click "Claim" to mark it. We promise not to peek at what\'s been claimed. This works on the honor system, so please only claim items you\'ve actually bought. We appreciate you!',
      },
    ]);

    // Create sample wishlists
    const [dadWishlist] = await db.insert(wishlists).values({
      name: "Dad's Wishlist",
      slug: 'dads-wishlist',
      description: 'Birthday and holiday gift ideas',
      imageUrl: '/images/wishlists/dad.png',
      isPublic: true,
    }).returning();

    const [momWishlist] = await db.insert(wishlists).values({
      name: "Mom's Wishlist",
      slug: 'moms-wishlist',
      description: 'Things I would love!',
      imageUrl: '/images/wishlists/mom.png',
      isPublic: true,
    }).returning();

    const [childWishlist] = await db.insert(wishlists).values({
      name: "Child's Wishlist",
      slug: 'childs-wishlist',
      description: 'Toys, books, and fun things!',
      imageUrl: '/images/wishlists/child.png',
      isPublic: true,
    }).returning();

    // Dad's wishlist items
    await db.insert(wishlistItems).values([
      {
        wishlistId: dadWishlist.id,
        name: 'The Book of Unusual Knowledge: Big Book of Fascinating Facts & Information',
        description: 'I love learning random trivia and this looks like the perfect coffee table book to flip through when I have a few minutes.',
        price: 10.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 0,
        imageUrl: '/images/items/dad1.jpg',
        purchaseUrls: [
          { label: 'Amazon - $10.00', url: 'https://www.amazon.com/Unusual-Knowledge-Editors-Publications-International/dp/1450845800/ref=sr_1_6' },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Anker PowerCore 10000 Portable Charger',
        description: 'My phone always dies when I need it most. This would be perfect for keeping in my bag for emergencies.',
        price: 26.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 1,
        imageUrl: '/images/items/dad2.jpg',
        purchaseUrls: [
          { label: 'Amazon - $26.00', url: 'https://www.amazon.com/Anker-PowerCore-Ultra-Compact-High-Speed-Technology/dp/B0194WDVHI' },
          { label: 'Micro Center - $29.99', url: 'https://www.microcenter.com/product/686695/anker-10k-225w-power-bank' },
          { label: 'Staples - $34.99', url: 'https://www.staples.com/anker-powercore-power-bank-10000mah-22-5w-portable-charger-with-usb-c-lanyard-cable-black-a1388h11-1/product_24617552' },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Yeti Rambler 20 oz Tumbler',
        description: 'I want something that keeps my coffee hot during my entire commute. This looks like it would be perfect.',
        price: 30.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 2,
        imageUrl: '/images/items/dad3.webp',
        purchaseUrls: [
          { label: 'Amazon - $30.00', url: 'https://www.amazon.com/YETI-Rambler-Tumbler-Vacuum-Insulated/dp/B073WKWYJJ' },
          { label: 'YETI - $30.00', url: 'https://www.yeti.com/drinkware/tumblers/rambler-20-oz-tumbler.html' },
          { label: 'REI - $30.00', url: 'https://www.rei.com/product/113804/yeti-rambler-20-fl-oz-tumbler' },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Tile Mate Bluetooth Tracker 4-Pack',
        description: 'I lose my keys at least twice a week. These would save me so much time and frustration.',
        price: 70.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 3,
        imageUrl: '/images/items/dad4.webp',
        purchaseUrls: [
          { label: 'Amazon - $70.00', url: 'https://www.amazon.com/Tile-Mate-4-Pack-Bluetooth-Finder/dp/B09B2WLRWH' },
          { label: 'Best Buy - $74.99', url: 'https://www.bestbuy.com/site/tile-mate-bluetooth-tracker-4-pack/6451674.p' },
          { label: 'Target - $69.99', url: 'https://www.target.com/p/tile-mate-bluetooth-tracker-4pk/-/A-82215989' },
        ],
      },
      {
        wishlistId: dadWishlist.id,
        name: 'Leatherman Wave Plus Multi-Tool',
        description: 'I always need a tool when I don\'t have one. This has everything in one compact package.',
        price: 120.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 4,
        imageUrl: '/images/items/dad5.jpg',
        purchaseUrls: [
          { label: 'Amazon - $120.00', url: 'https://www.amazon.com/LEATHERMAN-Wave-Multitool-Black-Molle/dp/B07DD69QN3' },
          { label: 'REI - $124.95', url: 'https://www.rei.com/product/766953/leatherman-wave-plus-multitool' },
          { label: 'Home Depot - $119.99', url: 'https://www.homedepot.com/p/LEATHERMAN-Wave-Plus-Multi-Tool-832524/305408085' },
        ],
      },
    ]);

    // Mom's wishlist items
    await db.insert(wishlistItems).values([
      {
        wishlistId: momWishlist.id,
        name: 'Kindle Paperwhite (16 GB)',
        description: 'I love reading before bed and this would be perfect for not disturbing anyone with a lamp.',
        price: 140.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 0,
        imageUrl: '/images/items/mom1.jpg',
        purchaseUrls: [
          { label: 'Amazon - $139.99', url: 'https://www.amazon.com/Kindle-Paperwhite-16-GB/dp/B08N3J8GTX' },
          { label: 'Best Buy - $139.99', url: 'https://www.bestbuy.com/site/amazon-kindle-paperwhite-16gb/6522383.p' },
          { label: 'Target - $139.99', url: 'https://www.target.com/p/kindle-paperwhite/-/A-84491392' },
        ],
      },
      {
        wishlistId: momWishlist.id,
        name: 'Lululemon Align High-Rise Pant 25"',
        description: 'I need comfortable leggings for yoga class and these are supposed to be amazing.',
        price: 98.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 1,
        imageUrl: '/images/items/mom2.webp',
        purchaseUrls: [
          { label: 'Lululemon - $98.00', url: 'https://shop.lululemon.com/p/women-pants/Align-Pant-2' },
          { label: 'Amazon - $98.00', url: 'https://www.amazon.com/stores/page/lululemon' },
        ],
      },
      {
        wishlistId: momWishlist.id,
        name: 'Hydro Flask 32 oz Wide Mouth Water Bottle',
        description: 'I want to drink more water throughout the day and this keeps drinks cold for 24 hours.',
        price: 45.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 2,
        imageUrl: '/images/items/mom3.jpg',
        purchaseUrls: [
          { label: 'Amazon - $44.95', url: 'https://www.amazon.com/Hydro-Flask-Water-Bottle-Stainless/dp/B01ACVS6RE' },
          { label: 'REI - $44.95', url: 'https://www.rei.com/product/889468/hydro-flask-wide-mouth-water-bottle-32-fl-oz' },
          { label: 'Dick\'s Sporting Goods - $44.99', url: 'https://www.dickssportinggoods.com/p/hydro-flask-32-oz-wide-mouth-bottle/16hflu32zwd' },
        ],
      },
      {
        wishlistId: momWishlist.id,
        name: 'Revlon One-Step Volumizer Hair Dryer',
        description: 'My hair takes forever to style and this looks like it would save me so much time in the morning.',
        price: 40.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 3,
        imageUrl: '/images/items/mom4.jpg',
        purchaseUrls: [
          { label: 'Amazon - $39.99', url: 'https://www.amazon.com/Revlon-One-Step-Dryer-Volumizer/dp/B01LSUQSB0' },
          { label: 'Target - $39.99', url: 'https://www.target.com/p/revlon-one-step-volumizer/-/A-53003976' },
          { label: 'Walmart - $39.96', url: 'https://www.walmart.com/ip/Revlon-One-Step-Hair-Dryer-Volumizer/55689116' },
        ],
      },
      {
        wishlistId: momWishlist.id,
        name: 'Apple AirPods Pro (2nd Generation)',
        description: 'I need better earbuds for my workouts and calls. These have noise cancellation which would be perfect for the gym.',
        price: 249.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 4,
        imageUrl: '/images/items/mom5.jpg',
        purchaseUrls: [
          { label: 'Amazon - $249.00', url: 'https://www.amazon.com/Apple-Generation-Cancelling-Transparency-Personalized/dp/B0CHWRXH8B' },
          { label: 'Best Buy - $249.99', url: 'https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation/6447382.p' },
          { label: 'Target - $249.99', url: 'https://www.target.com/p/apple-airpods-pro-2nd-generation/-/A-85978622' },
        ],
      },
    ]);

    // Child's wishlist items
    await db.insert(wishlistItems).values([
      {
        wishlistId: childWishlist.id,
        name: 'LEGO Classic Medium Creative Brick Box',
        description: 'I love building things and making my own creations! This has so many pieces to build anything I can imagine.',
        price: 30.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 0,
        imageUrl: '/images/items/child1.jpg',
        purchaseUrls: [
          { label: 'Amazon - $29.99', url: 'https://www.amazon.com/LEGO-Classic-Medium-Creative-Construction/dp/B00NHQFA3Y' },
          { label: 'Target - $29.99', url: 'https://www.target.com/p/lego-classic-medium-creative-brick-box/-/A-14182781' },
          { label: 'Walmart - $29.97', url: 'https://www.walmart.com/ip/LEGO-Classic-Medium-Creative-Brick-Box-10696/34611691' },
        ],
      },
      {
        wishlistId: childWishlist.id,
        name: 'Crayola Ultimate Crayon Collection',
        description: 'I need more colors for my drawings! This has 152 crayons with all the colors I could ever want.',
        price: 20.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 1,
        imageUrl: '/images/items/child2.jpg',
        purchaseUrls: [
          { label: 'Amazon - $19.99', url: 'https://www.amazon.com/Crayola-Ultimate-Crayon-Collection-Colors/dp/B00LH32JDE' },
          { label: 'Target - $19.99', url: 'https://www.target.com/p/crayola-ultimate-crayon-collection/-/A-14676404' },
          { label: 'Walmart - $19.94', url: 'https://www.walmart.com/ip/Crayola-Ultimate-Crayon-Collection-152-Colors/26228172' },
        ],
      },
      {
        wishlistId: childWishlist.id,
        name: 'National Geographic Kids World Atlas',
        description: 'I want to learn about all the different countries and places in the world. This book has cool maps and pictures!',
        price: 25.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 2,
        imageUrl: '/images/items/child3.jpg',
        purchaseUrls: [
          { label: 'Amazon - $24.99', url: 'https://www.amazon.com/National-Geographic-Kids-World-Atlas/dp/1426375905' },
          { label: 'Barnes & Noble - $24.99', url: 'https://www.barnesandnoble.com/w/national-geographic-kids-world-atlas/1141356542' },
          { label: 'Target - $24.99', url: 'https://www.target.com/p/national-geographic-kids-world-atlas/-/A-87621944' },
        ],
      },
      {
        wishlistId: childWishlist.id,
        name: 'Razor A Kick Scooter',
        description: 'All my friends have scooters and I really want one too so I can ride with them to the park!',
        price: 40.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 3,
        imageUrl: '/images/items/child4.jpg',
        purchaseUrls: [
          { label: 'Amazon - $39.99', url: 'https://www.amazon.com/Razor-Kick-Scooter-FFP/dp/B00005NBON' },
          { label: 'Target - $39.99', url: 'https://www.target.com/p/razor-a-kick-scooter/-/A-10853734' },
          { label: 'Walmart - $39.88', url: 'https://www.walmart.com/ip/Razor-A-Kick-Scooter/10314287' },
        ],
      },
      {
        wishlistId: childWishlist.id,
        name: 'Melissa & Doug Wooden Building Blocks Set',
        description: 'I like making towers and houses with blocks. These wooden ones look really cool and sturdy!',
        price: 35.00,
        currency: 'USD',
        quantity: 1,
        sortOrder: 4,
        imageUrl: '/images/items/child5.jpg',
        purchaseUrls: [
          { label: 'Amazon - $34.99', url: 'https://www.amazon.com/Melissa-Doug-Standard-Wooden-Building/dp/B00005RF5G' },
          { label: 'Target - $34.99', url: 'https://www.target.com/p/melissa-doug-wooden-building-blocks-set/-/A-10917067' },
          { label: 'Walmart - $34.97', url: 'https://www.walmart.com/ip/Melissa-Doug-Wooden-Building-Blocks-Set/5024533' },
        ],
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
