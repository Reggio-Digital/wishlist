import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, validateAdminCredentials, isSecureCookie } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(username);
    const refreshToken = generateRefreshToken(username);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: { username },
      accessToken,
      refreshToken,
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: isSecureCookie(request),
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 72 * 60 * 60, // 72 hours
    });

    response.cookies.set('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
