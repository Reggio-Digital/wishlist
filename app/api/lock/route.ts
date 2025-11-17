import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, settings } from '@/lib/db';
import crypto from 'crypto';

// POST /api/lock - Verify password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get the stored password hash
    const hashSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'passwordLockHash'))
      .limit(1);

    if (hashSetting.length === 0) {
      return NextResponse.json(
        { error: 'Password lock not configured' },
        { status: 400 }
      );
    }

    // Hash the provided password
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    // Compare hashes
    if (hash === hashSetting[0].value) {
      // Password correct - set a cookie
      const response = NextResponse.json({
        success: true,
        message: 'Password verified',
      });

      // Set an unlock cookie that expires in 24 hours
      response.cookies.set('site_unlocked', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
