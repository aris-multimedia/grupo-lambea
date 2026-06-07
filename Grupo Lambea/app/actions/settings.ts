'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { sql } from '@/lib/db';
import { ensureSettingsTable, SETTINGS_TAG } from '@/lib/settings';
import { FIELDS } from '@/lib/settings-schema';

export async function updateSettings(formData: FormData) {
  await ensureSettingsTable();

  for (const field of FIELDS) {
    // Solo persistimos los campos que el formulario ha enviado. Así el form de
    // Ajustes (que NO incluye la promo) nunca pisa las claves de promoción, que
    // se gestionan aparte desde el manager del Escritorio (updatePromo).
    if (formData.get(field.key) === null) continue;

    let value: string;
    if (field.type === 'boolean') {
      // Los checkboxes/toggles llegan como 'true'/'false' (los fija el form).
      value = formData.get(field.key) === 'true' ? 'true' : 'false';
    } else {
      value = ((formData.get(field.key) as string) ?? '').trim();
    }

    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${field.key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }

  // Invalida la lectura cacheada (read-your-own-writes) y refresca el árbol público.
  updateTag(SETTINGS_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/ajustes');

  return { ok: true };
}

/** Guardar la promoción activa desde el manager del Escritorio. */
export async function updatePromo(data: {
  activa: boolean;
  tipo: string;
  titulo: string;
  descripcion: string;
  valor: string;
}) {
  await ensureSettingsTable();
  const entries: [string, string][] = [
    ['promo_activa', data.activa ? 'true' : 'false'],
    ['promo_tipo', data.tipo],
    ['promo_titulo', data.titulo.trim()],
    ['promo_descripcion', data.descripcion.trim()],
    ['promo_valor', data.valor.trim()],
  ];
  for (const [key, value] of entries) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  updateTag(SETTINGS_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  return { ok: true };
}

/** Activar/desactivar la promoción desde el Escritorio (acceso rápido). */
export async function setPromoActiva(activa: boolean) {
  await ensureSettingsTable();
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('promo_activa', ${activa ? 'true' : 'false'}, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
  `;
  updateTag(SETTINGS_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  return { ok: true };
}
