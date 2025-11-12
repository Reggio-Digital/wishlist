import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db, wishlists } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch only public wishlists
    const publicWishlists = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.isPublic, true))
      .orderBy(desc(wishlists.updatedAt));

    return NextResponse.json({
      success: true,
      wishlists: publicWishlists,
    });
  } catch (error) {
    console.error('Error fetching public wishlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlists' },
      { status: 500 }
    );
  }
}
