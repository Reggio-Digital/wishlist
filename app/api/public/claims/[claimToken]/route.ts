import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, wishlistItems, wishlists } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ claimToken: string }> }
) {
  try {
    const { claimToken } = await params;

    // Find the item by claim token
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.claimedByToken, claimToken))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      message: 'Item unclaimed successfully',
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error unclaiming item:', error);
    return NextResponse.json(
      { error: 'Failed to unclaim item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ claimToken: string }> }
) {
  try {
    const { claimToken } = await params;
    const body = await request.json();
    const { name, note, isPurchased } = body;

    // Find the item by claim token
    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.claimedByToken, claimToken))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      item: updatedItem[0],
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}
