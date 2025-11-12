import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, wishlistItems, wishlists } from '@/lib/db';
import { createId } from '@paralleldrive/cuid2';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, note } = body;

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

    // Check if item is already claimed
    if (item[0].claimedByToken) {
      return NextResponse.json(
        { error: 'Item is already claimed' },
        { status: 409 }
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

    return NextResponse.json(
      {
        success: true,
        claimToken,
        item: updatedItem[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error claiming item:', error);
    return NextResponse.json(
      { error: 'Failed to claim item' },
      { status: 500 }
    );
  }
}
