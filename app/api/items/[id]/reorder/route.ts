import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, wishlistItems } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { newSortOrder } = body;

    if (newSortOrder === undefined || typeof newSortOrder !== 'number') {
      return NextResponse.json(
        { error: 'newSortOrder is required and must be a number' },
        { status: 400 }
      );
    }

    // Validate newSortOrder is not negative
    if (newSortOrder < 0) {
      return NextResponse.json(
        { error: 'newSortOrder must be a non-negative number' },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const oldSortOrder = existingItem[0].sortOrder;
    const wishlistId = existingItem[0].wishlistId;

    // Get all items for this wishlist sorted by sortOrder
    const allItems = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlistId))
      .orderBy(wishlistItems.sortOrder);

    // Validate newSortOrder is within bounds
    if (newSortOrder >= allItems.length) {
      return NextResponse.json(
        { error: `newSortOrder must be less than ${allItems.length}` },
        { status: 400 }
      );
    }

    // Skip if no change needed
    if (oldSortOrder === newSortOrder) {
      return NextResponse.json({
        success: true,
        item: existingItem[0],
      });
    }

    // Remove the item being moved from the array
    const movingItemIndex = allItems.findIndex(item => item.id === id);

    // Safety check: ensure item was found in the array
    if (movingItemIndex === -1) {
      console.error(`Item ${id} not found in wishlist items array`);
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 500 }
      );
    }

    const movingItem = allItems[movingItemIndex];
    allItems.splice(movingItemIndex, 1);

    // Insert it at the new position
    allItems.splice(newSortOrder, 0, movingItem);

    // Update all sortOrders in a transaction for atomicity
    const updatedItem = await db.transaction(async (tx) => {
      // Update all sortOrders
      for (let i = 0; i < allItems.length; i++) {
        await tx
          .update(wishlistItems)
          .set({
            sortOrder: i,
            updatedAt: new Date(),
          })
          .where(eq(wishlistItems.id, allItems[i].id));
      }

      // Get the updated moving item
      const result = await tx
        .select()
        .from(wishlistItems)
        .where(eq(wishlistItems.id, id))
        .limit(1);

      return result[0];
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error('Error reordering item:', error);
    return NextResponse.json(
      { error: 'Failed to reorder item' },
      { status: 500 }
    );
  }
}
