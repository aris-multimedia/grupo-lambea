import { sql } from './db';

export interface UploadedMedia {
  id: number;
  url: string;
  filename: string;
  size_bytes: number;
  uploaded_at: string;
}

export async function ensureMediaTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS media (
      id          SERIAL PRIMARY KEY,
      url         TEXT NOT NULL UNIQUE,
      filename    TEXT NOT NULL,
      size_bytes  INTEGER NOT NULL DEFAULT 0,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

export async function getUploadedMedia(): Promise<UploadedMedia[]> {
  await ensureMediaTable();
  const rows = await sql`
    SELECT id, url, filename, size_bytes, uploaded_at
    FROM media
    ORDER BY uploaded_at DESC
  `;
  return rows as UploadedMedia[];
}

export async function insertMedia(
  url: string,
  filename: string,
  sizeBytes: number
): Promise<void> {
  await sql`
    INSERT INTO media (url, filename, size_bytes)
    VALUES (${url}, ${filename}, ${sizeBytes})
    ON CONFLICT (url) DO NOTHING
  `;
}

export async function deleteMedia(url: string): Promise<void> {
  await sql`DELETE FROM media WHERE url = ${url}`;
}
