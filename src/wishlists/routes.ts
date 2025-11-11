import { Router, Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db, wishlists, wishlistItems } from '../db/index.js';
import { authenticate } from '../auth/middleware.js';

const router = Router();

/**
 * GET /api/wishlists
 * List all wishlists (authenticated)
 */
router.get('/api/wishlists', authenticate, async (_req: Request, res: Response) => {
  try {
    const allWishlists = await db
      .select()
      .from(wishlists)
      .orderBy(desc(wishlists.updatedAt));

    res.json({
      success: true,
      wishlists: allWishlists,
    });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    res.status(500).json({ error: 'Failed to fetch wishlists' });
  }
});

/**
 * POST /api/wishlists
 * Create a new wishlist (authenticated)
 */
router.post('/api/wishlists', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, notes, coverImageType, coverImageUrl, isPublic } = req.body;

    // Validation
    if (!name || !slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }

    // Check if slug already exists
    const existingWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.slug, slug))
      .limit(1);

    if (existingWishlist.length > 0) {
      res.status(409).json({ error: 'A wishlist with this slug already exists' });
      return;
    }

    // Create wishlist
    const newWishlist = await db
      .insert(wishlists)
      .values({
        name,
        slug,
        description: description || null,
        notes: notes || null,
        coverImageType: coverImageType || null,
        coverImageUrl: coverImageUrl || null,
        isPublic: isPublic !== undefined ? isPublic : false,
      })
      .returning();

    res.status(201).json({
      success: true,
      wishlist: newWishlist[0],
    });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    res.status(500).json({ error: 'Failed to create wishlist' });
  }
});

/**
 * GET /api/wishlists/:id
 * Get a single wishlist by ID (authenticated)
 */
router.get('/api/wishlists/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    res.json({
      success: true,
      wishlist: wishlist[0],
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

/**
 * PATCH /api/wishlists/:id
 * Update a wishlist (authenticated)
 */
router.patch('/api/wishlists/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, notes, coverImageType, coverImageUrl, isPublic } = req.body;

    // Check if wishlist exists
    const existingWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (existingWishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug !== existingWishlist[0].slug) {
      const slugExists = await db
        .select()
        .from(wishlists)
        .where(eq(wishlists.slug, slug))
        .limit(1);

      if (slugExists.length > 0) {
        res.status(409).json({ error: 'A wishlist with this slug already exists' });
        return;
      }
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (coverImageType !== undefined) updateData.coverImageType = coverImageType;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Update wishlist
    const updatedWishlist = await db
      .update(wishlists)
      .set(updateData)
      .where(eq(wishlists.id, id))
      .returning();

    res.json({
      success: true,
      wishlist: updatedWishlist[0],
    });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

/**
 * DELETE /api/wishlists/:id
 * Delete a wishlist (authenticated)
 */
router.delete('/api/wishlists/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if wishlist exists
    const existingWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (existingWishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    // Delete wishlist (cascade will delete items automatically)
    await db
      .delete(wishlists)
      .where(eq(wishlists.id, id));

    res.json({
      success: true,
      message: 'Wishlist deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    res.status(500).json({ error: 'Failed to delete wishlist' });
  }
});

/**
 * GET /:slug
 * Public wishlist view (no authentication required)
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Find wishlist by slug
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.slug, slug))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    // Check if wishlist is public
    if (!wishlist[0].isPublic) {
      res.status(403).json({ error: 'This wishlist is private' });
      return;
    }

    // Get all items for this wishlist (excluding archived items)
    const items = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlist[0].id))
      .orderBy(wishlistItems.sortOrder);

    // Filter out private admin notes
    const publicItems = items.map((item) => {
      const { notes, ...publicItem } = item;
      return publicItem;
    });

    res.json({
      success: true,
      wishlist: {
        ...wishlist[0],
        notes: undefined, // Don't expose admin notes
      },
      items: publicItems,
    });
  } catch (error) {
    console.error('Error fetching public wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

export default router;
