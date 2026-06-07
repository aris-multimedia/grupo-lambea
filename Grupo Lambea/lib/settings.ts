import { cacheLife, cacheTag } from 'next/cache';
import { sql } from './db';
import { DEFAULTS, toNested, type SiteSettings } from './settings-schema';

export type { SiteSettings };
export const SETTINGS_TAG = 'site-settings';

export async function ensureSettingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

/** Lectura cacheada para la web pública. Si la tabla no existe aún, devuelve los defaults. */
export async function getSettings(): Promise<SiteSettings> {
  'use cache';
  cacheLife('hours');
  cacheTag(SETTINGS_TAG);

  let record: Record<string, string> = {};
  try {
    const rows = await sql`SELECT key, value FROM site_settings`;
    for (const r of rows as { key: string; value: string | null }[]) {
      if (r.value != null) record[r.key] = r.value;
    }
  } catch {
    record = {}; // tabla aún no creada → defaults
  }
  return toNested(record);
}

/** Lectura sin cache para el formulario de admin (siempre fresco). Devuelve el registro plano. */
export async function getSettingsRaw(): Promise<Record<string, string>> {
  await ensureSettingsTable();
  const rows = await sql`SELECT key, value FROM site_settings`;
  const record: Record<string, string> = { ...DEFAULTS };
  for (const r of rows as { key: string; value: string | null }[]) {
    if (r.value != null) record[r.key] = r.value;
  }
  return record;
}
