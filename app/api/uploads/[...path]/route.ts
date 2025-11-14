import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Upload directory location
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params in Next.js 16+
    const { path: pathSegments } = await params;

    console.log('Upload request - pathSegments:', pathSegments);
    console.log('UPLOAD_DIR:', UPLOAD_DIR);

    // Get the file path from the URL
    const filePath = path.join(UPLOAD_DIR, ...pathSegments);
    console.log('Constructed filePath:', filePath);

    // Security: Ensure the resolved path is within UPLOAD_DIR
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);

    console.log('Resolved path:', resolvedPath);
    console.log('Resolved upload dir:', resolvedUploadDir);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      console.log('Security check failed - path outside upload dir');
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      console.log('File not found at:', resolvedPath);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    console.log('File exists, serving...');

    // Read the file
    const fileBuffer = await readFile(resolvedPath);

    // Determine content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
