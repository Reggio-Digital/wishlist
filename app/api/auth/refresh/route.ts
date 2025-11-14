import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    let refreshToken: string | undefined;

    const cookieToken = request.cookies.get('refresh_token')?.value;
    if (cookieToken) {
      refreshToken = cookieToken;
    } else {
      try {
        const body = await request.json();
        refreshToken = body.refreshToken;
      } catch {
        // No body or invalid JSON, continue without it
        refreshToken = undefined;
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload.username);
    const newRefreshToken = generateRefreshToken(payload.username);

    // Create response
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 72 * 60 * 60, // 72 hours
    });

    response.cookies.set('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
