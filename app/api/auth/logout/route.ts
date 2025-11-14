import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');

  return response;
}
