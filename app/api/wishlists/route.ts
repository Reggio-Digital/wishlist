import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db, wishlists } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
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

    const allWishlists = await db
      .select()
      .from(wishlists)
      .orderBy(desc(wishlists.updatedAt));

    return NextResponse.json({
      success: true,
      wishlists: allWishlists,
    });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, slug, description, notes, isPublic } = body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.slug, slug))
      .limit(1);

    if (existingWishlist.length > 0) {
      return NextResponse.json(
        { error: 'A wishlist with this slug already exists' },
        { status: 409 }
      );
    }

    // Create wishlist
    const newWishlist = await db
      .insert(wishlists)
      .values({
        name,
        slug,
        description: description || null,
        notes: notes || null,
        isPublic: isPublic !== undefined ? isPublic : false,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        wishlist: newWishlist[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to create wishlist' },
      { status: 500 }
    );
  }
}
