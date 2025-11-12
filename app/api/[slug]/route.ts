import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, wishlists } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.slug, slug))
      .limit(1);

    if (wishlist.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Only return public wishlists
    if (!wishlist[0].isPublic) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist: wishlist[0],
    });
  } catch (error) {
    console.error('Error fetching wishlist by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}
