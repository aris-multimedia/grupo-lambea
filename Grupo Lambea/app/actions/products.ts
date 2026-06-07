'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';

interface VariantPayload {
  id: number | null;
  formato: string;
  precio: number | null;
  imagen_url: string | null;
  orden: number;
}

interface GalleryPayload {
  url: string;
  alt: string;
}

/**
 * Convierte un valor de formulario a número de forma segura.
 * Acepta coma decimal ("19,50") y separadores de miles, y NUNCA devuelve NaN
 * (Postgres rechaza NaN en columnas numéricas → era la causa del error al guardar).
 */
function parseNum(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  // "1.234,56" → "1234.56" ; "19,50" → "19.50"
  const normalized = raw.replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export async function updateProduct(slug: string, formData: FormData) {
  try {
    return await updateProductInner(slug, formData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    // Deja pasar el redirect de Next; el resto se reporta al usuario
    if (msg.includes('NEXT_REDIRECT')) throw err;
    console.error('[updateProduct] error:', msg);
    return { error: `No se pudo guardar: ${msg}` };
  }
}

async function updateProductInner(slug: string, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  if (!nombre?.trim()) return { error: 'El nombre es obligatorio' };

  const descripcion_corta   = (formData.get('descripcion_corta') as string) || null;
  const descripcion_larga   = (formData.get('descripcion_larga') as string) || null;
  const instrucciones_uso   = (formData.get('instrucciones_uso') as string) || null;
  const codigo_toxicologia  = (formData.get('codigo_toxicologia') as string) || null;
  const imagen              = (formData.get('imagen') as string) || null;
  const ficha_tecnica_url   = (formData.get('ficha_tecnica_url') as string) || null; // stored in product_documents, not products table

  const precio_desde = parseNum(formData.get('precio_desde'));
  const precio_hasta = parseNum(formData.get('precio_hasta'));

  const publicado   = formData.get('publicado') === 'true';
  const bestseller  = formData.get('bestseller') === 'true';
  const promo_3x2   = formData.get('promo_3x2') === 'true';
  const visible_admin = formData.get('visible_admin') !== 'false'; // por defecto visible

  const valoracion = parseNum(formData.get('valoracion'));
  const num_valoraciones = parseNum(formData.get('num_valoraciones'));

  // Aplicaciones sent as comma-separated
  const aplicaciones = ((formData.get('aplicaciones') as string) || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  // Usos / características: one per line (or comma-separated fallback)
  function toArray(val: string | null): string[] {
    if (!val) return [];
    const sep = val.includes('\n') ? '\n' : ',';
    return val.split(sep).map((s) => s.trim()).filter(Boolean);
  }
  const usos = toArray(formData.get('usos') as string | null);
  const caracteristicas = toArray(formData.get('caracteristicas') as string | null);

  // formatos: derived from variants but keep the column in sync
  const variantsJson = (formData.get('variants_json') as string) || '[]';
  let variants: VariantPayload[] = [];
  try { variants = JSON.parse(variantsJson); } catch { /* ignore */ }

  const galleryJson = (formData.get('gallery_json') as string) || '[]';
  let gallery: GalleryPayload[] = [];
  try { gallery = JSON.parse(galleryJson); } catch { /* ignore */ }

  const formatos = variants.map((v) => v.formato).filter(Boolean);

  // Auto-calculate precio_desde / precio_hasta from variants if not overridden
  const variantPrices = variants.map((v) => v.precio).filter((p): p is number => p != null);
  const precioDesde = precio_desde ?? (variantPrices.length ? Math.min(...variantPrices) : null);
  const precioHasta = precio_hasta ?? (variantPrices.length ? Math.max(...variantPrices) : null);

  // 1. Update main product row
  const [updated] = await sql`
    UPDATE products SET
      nombre              = ${nombre},
      descripcion_corta   = ${descripcion_corta},
      descripcion_larga   = ${descripcion_larga},
      instrucciones_uso   = ${instrucciones_uso},
      codigo_toxicologia  = ${codigo_toxicologia},
      imagen              = ${imagen},
      precio_desde        = ${precioDesde},
      precio_hasta        = ${precioHasta},
      publicado           = ${publicado},
      bestseller          = ${bestseller},
      promo_3x2           = ${promo_3x2},
      visible_admin       = ${visible_admin},
      valoracion          = ${valoracion},
      num_valoraciones    = ${num_valoraciones},
      aplicaciones        = ${aplicaciones},
      formatos            = ${formatos},
      usos                = ${usos},
      caracteristicas     = ${caracteristicas},
      updated_at          = NOW()
    WHERE slug = ${slug}
    RETURNING id
  `;

  if (!updated?.id) return { error: 'Producto no encontrado' };
  const productId = Number(updated.id);

  // 2. Upsert ficha_tecnica in product_documents
  if (ficha_tecnica_url) {
    await sql`
      INSERT INTO product_documents (product_id, tipo, idioma, url)
      VALUES (${productId}, 'ficha_tecnica', 'es', ${ficha_tecnica_url})
      ON CONFLICT (product_id, tipo, idioma)
      DO UPDATE SET url = EXCLUDED.url
    `;
  } else {
    await sql`
      DELETE FROM product_documents
      WHERE product_id = ${productId} AND tipo = 'ficha_tecnica' AND idioma = 'es'
    `;
  }

  // 4. Sync product_variants
  const incomingIds = variants.filter((v) => v.id != null).map((v) => v.id as number);

  // Delete variants not present in the incoming list
  if (incomingIds.length > 0) {
    await sql`
      DELETE FROM product_variants
      WHERE product_id = ${productId} AND id <> ALL(${incomingIds})
    `;
  } else {
    await sql`DELETE FROM product_variants WHERE product_id = ${productId}`;
  }

  for (const v of variants) {
    if (!v.formato?.trim()) continue;            // ignora filas de variante vacías
    const precio = Number.isFinite(v.precio as number) ? (v.precio as number) : 0; // columna NOT NULL
    if (v.id != null) {
      await sql`
        UPDATE product_variants SET
          formato    = ${v.formato},
          precio     = ${precio},
          imagen_url = ${v.imagen_url ?? null},
          orden      = ${v.orden}
        WHERE id = ${v.id} AND product_id = ${productId}
      `;
    } else {
      await sql`
        INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
        VALUES (${productId}, ${v.formato}, ${precio}, ${v.imagen_url ?? null}, ${v.orden})
      `;
    }
  }

  // 5. Sync product_images gallery
  await sql`DELETE FROM product_images WHERE product_id = ${productId}`;
  for (const [i, img] of gallery.entries()) {
    if (img.url?.trim()) {
      await sql`
        INSERT INTO product_images (product_id, url, alt, orden, is_primary)
        VALUES (${productId}, ${img.url.trim()}, ${img.alt || null}, ${i}, ${i === 0})
      `;
    }
  }

  revalidatePath('/admin/productos');
  revalidatePath(`/admin/productos/${slug}`);
  revalidatePath(`/tienda/${slug}`);
}
