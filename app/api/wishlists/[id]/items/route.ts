import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db, wishlistItems, wishlists } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check for auth token
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyAccessToken(token) : null;
    const isAuthenticated = payload !== null;

    // Check if wishlist exists
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (wishlist.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!wishlist[0].isPublic && !isAuthenticated) {
      return NextResponse.json(
        { error: 'This wishlist is private' },
        { status: 403 }
      );
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

    return NextResponse.json({
      success: true,
      items: responseItems,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

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
    const {
      name,
      description,
      price,
      currency,
      quantity,
      images,
      purchaseUrls,
      notes,
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    // Check if wishlist exists
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .limit(1);

    if (wishlist.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
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
        images: images || null,
        purchaseUrls: purchaseUrls || null,
        notes: notes || null,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        item: newItem[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
