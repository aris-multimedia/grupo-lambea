import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { decrypt } from '@/lib/session';
import { ensureMediaTable, insertMedia } from '@/lib/media';

// Convert to WebP always. Apply more compression if original > 300 KB.
const COMPRESS_THRESHOLD = 300 * 1024;

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const raw = cookieHeader.split(';').find((c) => c.trim().startsWith('admin_session='));
  const token = raw?.split('=').slice(1).join('=');
  if (!token) return false;
  const session = await decrypt(token);
  return !!session;
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB hard cap
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'El archivo supera el límite de 50 MB' }, { status: 400 });
  }

  const original = Buffer.from(await file.arrayBuffer());
  const originalKb = Math.round(original.length / 1024);

  const quality = original.length > COMPRESS_THRESHOLD ? 75 : 85;
  const processed = await sharp(original).webp({ quality }).toBuffer();
  const processedKb = Math.round(processed.length / 1024);

  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  const filename = `${baseName}-${Date.now()}.webp`;

  await ensureMediaTable();

  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Production: Vercel Blob
    const { put } = await import('@vercel/blob');
    const blob = await put(`media/${filename}`, processed, {
      access: 'public',
      contentType: 'image/webp',
    });
    url = blob.url;
  } else {
    // Development: write to public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), processed);
    url = `/uploads/${filename}`;
  }

  await insertMedia(url, filename, processed.length);

  return NextResponse.json({ url, originalKb, processedKb });
}
