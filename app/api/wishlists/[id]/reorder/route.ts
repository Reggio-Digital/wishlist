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

    // Validate newSortOrder is not negative
    if (newSortOrder < 0) {
      return NextResponse.json(
        { error: 'newSortOrder must be a non-negative number' },
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

    // Get all wishlists sorted by sortOrder
    const allWishlists = await db
      .select()
      .from(wishlists)
      .orderBy(wishlists.sortOrder);

    // Validate newSortOrder is within bounds
    if (newSortOrder >= allWishlists.length) {
      return NextResponse.json(
        { error: `newSortOrder must be less than ${allWishlists.length}` },
        { status: 400 }
      );
    }

    // Skip if no change needed
    if (oldSortOrder === newSortOrder) {
      return NextResponse.json({
        success: true,
        wishlist: existingWishlist[0],
      });
    }

    // Remove the wishlist being moved from the array
    const movingWishlistIndex = allWishlists.findIndex(w => w.id === id);

    // Safety check: ensure wishlist was found in the array
    if (movingWishlistIndex === -1) {
      console.error(`Wishlist ${id} not found in wishlists array`);
      return NextResponse.json(
        { error: 'Wishlist not found in array' },
        { status: 500 }
      );
    }

    const movingWishlist = allWishlists[movingWishlistIndex];
    allWishlists.splice(movingWishlistIndex, 1);

    // Insert it at the new position
    allWishlists.splice(newSortOrder, 0, movingWishlist);

    // Update all sortOrders in a transaction for atomicity
    const updatedWishlist = await db.transaction(async (tx) => {
      // Update all sortOrders
      for (let i = 0; i < allWishlists.length; i++) {
        await tx
          .update(wishlists)
          .set({
            sortOrder: i,
            updatedAt: new Date(),
          })
          .where(eq(wishlists.id, allWishlists[i].id));
      }

      // Get the updated wishlist
      const result = await tx
        .select()
        .from(wishlists)
        .where(eq(wishlists.id, id))
        .limit(1);

      return result[0];
    });

    return NextResponse.json({
      success: true,
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error('Error reordering wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to reorder wishlist' },
      { status: 500 }
    );
  }
}
