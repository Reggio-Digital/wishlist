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

    // Skip if no change needed
    if (oldSortOrder === newSortOrder) {
      return NextResponse.json({
        success: true,
        item: existingItem[0],
      });
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

    return NextResponse.json({
      success: true,
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error reordering item:', error);
    return NextResponse.json(
      { error: 'Failed to reorder item' },
      { status: 500 }
    );
  }
}
