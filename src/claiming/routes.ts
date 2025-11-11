import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, wishlistItems, wishlists } from '../db/index.js';
import { createId } from '@paralleldrive/cuid2';

const router = Router();

/**
 * POST /api/public/items/:id/claim
 * Claim an item (no authentication required)
 * Body: { name?: string, note?: string }
 */
router.post('/api/public/items/:id/claim', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, note } = req.body;

    // Get the item
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (item.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Check if item is already claimed
    if (item[0].claimedByToken) {
      res.status(409).json({ error: 'Item is already claimed' });
      return;
    }

    // Check if wishlist is public
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, item[0].wishlistId))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    if (!wishlist[0].isPublic) {
      res.status(403).json({ error: 'This wishlist is private' });
      return;
    }

    // Generate unique claim token
    const claimToken = createId();

    // Update item with claim information
    const updatedItem = await db
      .update(wishlistItems)
      .set({
        claimedByName: name || null,
        claimedByNote: note || null,
        claimedByToken: claimToken,
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(wishlistItems.id, id))
      .returning();

    res.status(201).json({
      success: true,
      claimToken,
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ error: 'Failed to claim item' });
  }
});

/**
 * DELETE /api/public/claims/:claimToken
 * Unclaim an item using the claim token (no authentication required)
 */
router.delete('/api/public/claims/:claimToken', async (req: Request, res: Response) => {
  try {
    const { claimToken } = req.params;

    // Find the item by claim token
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.claimedByToken, claimToken))
      .limit(1);

    if (item.length === 0) {
      res.status(404).json({ error: 'Claim not found' });
      return;
    }

    // Check if wishlist is public
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, item[0].wishlistId))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    if (!wishlist[0].isPublic) {
      res.status(403).json({ error: 'This wishlist is private' });
      return;
    }

    // Remove claim information
    const updatedItem = await db
      .update(wishlistItems)
      .set({
        claimedByName: null,
        claimedByNote: null,
        claimedByToken: null,
        claimedAt: null,
        isPurchased: false,
        updatedAt: new Date(),
      })
      .where(eq(wishlistItems.claimedByToken, claimToken))
      .returning();

    res.json({
      success: true,
      message: 'Item unclaimed successfully',
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error unclaiming item:', error);
    res.status(500).json({ error: 'Failed to unclaim item' });
  }
});

/**
 * PATCH /api/public/claims/:claimToken
 * Update claim information (no authentication required)
 * Body: { name?: string, note?: string, isPurchased?: boolean }
 */
router.patch('/api/public/claims/:claimToken', async (req: Request, res: Response) => {
  try {
    const { claimToken } = req.params;
    const { name, note, isPurchased } = req.body;

    // Find the item by claim token
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.claimedByToken, claimToken))
      .limit(1);

    if (item.length === 0) {
      res.status(404).json({ error: 'Claim not found' });
      return;
    }

    // Check if wishlist is public
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, item[0].wishlistId))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    if (!wishlist[0].isPublic) {
      res.status(403).json({ error: 'This wishlist is private' });
      return;
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.claimedByName = name;
    if (note !== undefined) updateData.claimedByNote = note;
    if (isPurchased !== undefined) updateData.isPurchased = isPurchased;

    // Update claim information
    const updatedItem = await db
      .update(wishlistItems)
      .set(updateData)
      .where(eq(wishlistItems.claimedByToken, claimToken))
      .returning();

    res.json({
      success: true,
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ error: 'Failed to update claim' });
  }
});

export default router;
