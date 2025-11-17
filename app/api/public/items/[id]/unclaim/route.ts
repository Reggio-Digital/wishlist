import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, wishlistItems, wishlists } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the item
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if item is actually claimed
    if (!item[0].claimedByToken) {
      return NextResponse.json(
        { error: 'Item is not claimed' },
        { status: 400 }
      );
    }

    // Check if wishlist is public
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, item[0].wishlistId))
      .limit(1);

    if (wishlist.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    if (!wishlist[0].isPublic) {
      return NextResponse.json(
        { error: 'This wishlist is private' },
        { status: 403 }
      );
    }

    // Remove claim information (honor system - no verification)
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
      .where(eq(wishlistItems.id, id))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Item unclaimed successfully',
        item: updatedItem[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unclaiming item:', error);
    return NextResponse.json(
      { error: 'Failed to unclaim item' },
      { status: 500 }
    );
  }
}
