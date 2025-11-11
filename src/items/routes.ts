import { Router, Request, Response } from 'express';
import { eq, and, gte, lte } from 'drizzle-orm';
import { db, wishlistItems, wishlists } from '../db/index.js';
import { authenticate, optionalAuthenticate } from '../auth/middleware.js';

const router = Router();

/**
 * GET /api/wishlists/:id/items
 * List all items for a wishlist
 * Public endpoint if wishlist is public, otherwise requires auth
 */
router.get('/api/wishlists/:id/items', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAuthenticated = req.user !== undefined;

    // Check if wishlist exists
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    // Check permissions
    if (!wishlist[0].isPublic && !isAuthenticated) {
      res.status(403).json({ error: 'This wishlist is private' });
      return;
    }

    // Get all items (exclude archived unless authenticated)
    const items = await db
      .select()
      .from(wishlistItems)
      .where(
        isAuthenticated
          ? eq(wishlistItems.wishlistId, id)
          : and(
              eq(wishlistItems.wishlistId, id),
              eq(wishlistItems.isArchived, false)
            )
      )
      .orderBy(wishlistItems.sortOrder);

    // Filter fields based on authentication
    const responseItems = items.map((item) => {
      if (isAuthenticated) {
        // Admin sees everything
        return item;
      } else {
        // Public view: exclude admin notes
        const { notes, ...publicItem } = item;
        return publicItem;
      }
    });

    res.json({
      success: true,
      items: responseItems,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * POST /api/wishlists/:id/items
 * Create a new item in a wishlist (authenticated)
 */
router.post('/api/wishlists/:id/items', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      currency,
      quantity,
      priority,
      images,
      purchaseUrls,
      notes,
    } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({ error: 'Item name is required' });
      return;
    }

    // Check if wishlist exists
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (wishlist.length === 0) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    // Get the highest sortOrder value to append the new item at the end
    const lastItem = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, id))
      .orderBy(wishlistItems.sortOrder)
      .limit(1);

    const nextSortOrder = lastItem.length > 0 ? lastItem[0].sortOrder + 1 : 0;

    // Create item
    const newItem = await db
      .insert(wishlistItems)
      .values({
        wishlistId: id,
        name,
        description: description || null,
        price: price || null,
        currency: currency || 'USD',
        quantity: quantity || 1,
        priority: priority || 'medium',
        images: images || null,
        purchaseUrls: purchaseUrls || null,
        notes: notes || null,
        sortOrder: nextSortOrder,
      })
      .returning();

    res.status(201).json({
      success: true,
      item: newItem[0],
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/**
 * GET /api/items/:id
 * Get a single item by ID
 * Public endpoint if wishlist is public, otherwise requires auth
 */
router.get('/api/items/:id', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAuthenticated = req.user !== undefined;

    // Get item
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (item.length === 0) {
      res.status(404).json({ error: 'Item not found' });
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

    // Check permissions
    if (!wishlist[0].isPublic && !isAuthenticated) {
      res.status(403).json({ error: 'This item is private' });
      return;
    }

    // Filter fields based on authentication
    let responseItem = item[0];
    if (!isAuthenticated) {
      const { notes, ...publicItem } = item[0];
      responseItem = publicItem as typeof item[0];
    }

    res.json({
      success: true,
      item: responseItem,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * PATCH /api/items/:id
 * Update an item (authenticated)
 */
router.patch('/api/items/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      currency,
      quantity,
      priority,
      images,
      purchaseUrls,
      notes,
      isArchived,
    } = req.body;

    // Check if item exists
    const existingItem = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (priority !== undefined) updateData.priority = priority;
    if (images !== undefined) updateData.images = images;
    if (purchaseUrls !== undefined) updateData.purchaseUrls = purchaseUrls;
    if (notes !== undefined) updateData.notes = notes;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    // Update item
    const updatedItem = await db
      .update(wishlistItems)
      .set(updateData)
      .where(eq(wishlistItems.id, id))
      .returning();

    res.json({
      success: true,
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/**
 * DELETE /api/items/:id
 * Delete an item (authenticated)
 */
router.delete('/api/items/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Delete item
    await db
      .delete(wishlistItems)
      .where(eq(wishlistItems.id, id));

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

/**
 * POST /api/items/:id/reorder
 * Reorder an item (for drag-and-drop support)
 * Body: { newSortOrder: number }
 */
router.post('/api/items/:id/reorder', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newSortOrder } = req.body;

    if (newSortOrder === undefined || typeof newSortOrder !== 'number') {
      res.status(400).json({ error: 'newSortOrder is required and must be a number' });
      return;
    }

    // Check if item exists
    const existingItem = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const oldSortOrder = existingItem[0].sortOrder;
    const wishlistId = existingItem[0].wishlistId;

    // Skip if no change needed
    if (oldSortOrder === newSortOrder) {
      res.json({
        success: true,
        item: existingItem[0],
      });
      return;
    }

    // Get all items for this wishlist sorted by sortOrder
    const allItems = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlistId))
      .orderBy(wishlistItems.sortOrder);

    // Remove the item being moved from the array
    const movingItemIndex = allItems.findIndex(item => item.id === id);
    const movingItem = allItems[movingItemIndex];
    allItems.splice(movingItemIndex, 1);

    // Insert it at the new position
    allItems.splice(newSortOrder, 0, movingItem);

    // Update all sortOrders sequentially
    for (let i = 0; i < allItems.length; i++) {
      await db
        .update(wishlistItems)
        .set({
          sortOrder: i,
          updatedAt: new Date(),
        })
        .where(eq(wishlistItems.id, allItems[i].id));
    }

    // Get the updated moving item
    const updatedItem = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    res.json({
      success: true,
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error reordering item:', error);
    res.status(500).json({ error: 'Failed to reorder item' });
  }
});

export default router;
