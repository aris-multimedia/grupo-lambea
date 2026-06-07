import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { decrypt } from '@/lib/session';
import { deleteMedia } from '@/lib/media';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const raw = cookieHeader.split(';').find((c) => c.trim().startsWith('admin_session='));
  const token = raw?.split('=').slice(1).join('=');
  if (!token) return false;
  const session = await decrypt(token);
  return !!session;
}

// DELETE /api/admin/media  — body: { url }
// Removes an uploaded media item from the DB and its underlying file/blob.
// Only operates on items stored in the `media` table (uploads); product images
// live in their own tables and are never deletable from here.
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: 'Falta la URL de la imagen' }, { status: 400 });
  }

  // Best-effort removal of the underlying file/blob. The DB row is the source of
  // truth for the gallery, so we always delete that even if storage cleanup fails.
  try {
    if (url.startsWith('/uploads/')) {
      // Development: local file under public/uploads
      const filePath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''));
      await fs.unlink(filePath).catch(() => {});
    } else if (process.env.BLOB_READ_WRITE_TOKEN && url.includes('blob.vercel-storage.com')) {
      const { del } = await import('@vercel/blob');
      await del(url);
    }
  } catch {
    // ignore storage errors — proceed to remove the DB record
  }

  await deleteMedia(url);

  return NextResponse.json({ ok: true });
}
