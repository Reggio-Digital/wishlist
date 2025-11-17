import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, wishlists } from '@/lib/db';
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

    // Check if wishlist exists
    const existingWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (existingWishlist.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    const oldSortOrder = existingWishlist[0].sortOrder;

    // Skip if no change needed
    if (oldSortOrder === newSortOrder) {
      return NextResponse.json({
        success: true,
        wishlist: existingWishlist[0],
      });
    }

    // Get all wishlists sorted by sortOrder
    const allWishlists = await db
      .select()
      .from(wishlists)
      .orderBy(wishlists.sortOrder);

    // Remove the wishlist being moved from the array
    const movingWishlistIndex = allWishlists.findIndex(w => w.id === id);
    const movingWishlist = allWishlists[movingWishlistIndex];
    allWishlists.splice(movingWishlistIndex, 1);

    // Insert it at the new position
    allWishlists.splice(newSortOrder, 0, movingWishlist);

    // Update all sortOrders sequentially
    for (let i = 0; i < allWishlists.length; i++) {
      await db
        .update(wishlists)
        .set({
          sortOrder: i,
          updatedAt: new Date(),
        })
        .where(eq(wishlists.id, allWishlists[i].id));
    }

    // Get the updated wishlist
    const updatedWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      wishlist: updatedWishlist[0],
    });
  } catch (error) {
    console.error('Error reordering wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to reorder wishlist' },
      { status: 500 }
    );
  }
}
