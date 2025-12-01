import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, settings } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/utils';
import crypto from 'crypto';

// GET /api/settings - Get all settings (public endpoint for reading only)
export async function GET(request: NextRequest) {
  try {
    const allSettings = await db.select().from(settings);

    // Convert to key-value object
    const settingsObj = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string | boolean>);

    // Set defaults if not found
    if (!settingsObj.siteTitle) {
      settingsObj.siteTitle = 'Wishlist';
    }
    if (!settingsObj.homepageSubtext) {
      settingsObj.homepageSubtext = 'Browse and explore available wishlists';
    }

    // Convert passwordLockEnabled to boolean
    (settingsObj as any).passwordLockEnabled = settingsObj.passwordLockEnabled === 'true';

    return NextResponse.json({
      success: true,
      settings: settingsObj,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(request: NextRequest) {
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
    const { siteTitle, homepageSubtext, passwordLockEnabled, passwordLock } = body;

    // Update or insert siteTitle
    if (siteTitle !== undefined) {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'siteTitle'))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: siteTitle, updatedAt: new Date() })
          .where(eq(settings.key, 'siteTitle'));
      } else {
        await db.insert(settings).values({
          key: 'siteTitle',
          value: siteTitle,
        });
      }
    }

    // Update or insert homepageSubtext
    if (homepageSubtext !== undefined) {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'homepageSubtext'))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: homepageSubtext, updatedAt: new Date() })
          .where(eq(settings.key, 'homepageSubtext'));
      } else {
        await db.insert(settings).values({
          key: 'homepageSubtext',
          value: homepageSubtext,
        });
      }
    }

    // Update or insert passwordLockEnabled
    if (passwordLockEnabled !== undefined) {
      const value = passwordLockEnabled ? 'true' : 'false';
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'passwordLockEnabled'))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value, updatedAt: new Date() })
          .where(eq(settings.key, 'passwordLockEnabled'));
      } else {
        await db.insert(settings).values({
          key: 'passwordLockEnabled',
          value,
        });
      }
    }

    // Update password hash if provided
    if (passwordLock && passwordLock.trim() !== '') {
      // Hash the password using SHA-256
      const hash = crypto.createHash('sha256').update(passwordLock).digest('hex');

      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'passwordLockHash'))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: hash, updatedAt: new Date() })
          .where(eq(settings.key, 'passwordLockHash'));
      } else {
        await db.insert(settings).values({
          key: 'passwordLockHash',
          value: hash,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
