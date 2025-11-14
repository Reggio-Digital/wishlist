import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

// Resize configuration
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 85;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'wishlist' or 'item'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const typeDir = path.join(UPLOAD_DIR, type === 'wishlist' ? 'wishlists' : 'items');
    if (!existsSync(typeDir)) {
      // Create directory with 0775 permissions (rwxrwxr-x)
      await mkdir(typeDir, { recursive: true, mode: 0o775 });
    }

    // Generate unique filename (always use .webp for output)
    const timestamp = Date.now();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.webp`;
    const filepath = path.join(typeDir, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Resize and optimize image
    const processedImage = await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    // Save processed image with explicit permissions (0666 = rw-rw-rw-)
    // This ensures the file is readable/writable by all users
    await writeFile(filepath, processedImage, { mode: 0o666 });

    console.log(`Uploaded file: ${filepath}`);

    // Return the public URL (must include /api prefix to match the route)
    const publicUrl = `/api/uploads/${type === 'wishlist' ? 'wishlists' : 'items'}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
