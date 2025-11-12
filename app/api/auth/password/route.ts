import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, validateAdminCredentials } from '@/lib/auth/utils';

export async function PATCH(request: NextRequest) {
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    // Validate current password
    if (!validateAdminCredentials(payload.username, currentPassword)) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // In a real implementation, you would update the password in a database
    // For now, we just return a message since password is in .env
    return NextResponse.json(
      {
        error: 'Password change not implemented. Please update ADMIN_PASSWORD in .env file.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Password change failed' },
      { status: 500 }
    );
  }
}
