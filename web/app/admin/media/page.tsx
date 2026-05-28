import { sql } from '@/lib/db';
import { getUploadedMedia } from '@/lib/media';
import { MediaGallery } from './MediaGallery';

export default async function AdminMediaPage() {
  const [productRows, uploaded] = await Promise.all([
    sql`
      SELECT
        p.imagen        AS url,
        p.nombre        AS label,
        p.familia       AS familia,
        'producto'      AS origen
      FROM products p
      WHERE p.imagen IS NOT NULL AND p.imagen <> ''

      UNION

      SELECT
        pv.imagen_url   AS url,
        pv.formato      AS label,
        p.familia       AS familia,
        'variante'      AS origen
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.imagen_url IS NOT NULL AND pv.imagen_url <> ''

      UNION

      SELECT
        pi.url          AS url,
        pi.alt          AS label,
        p.familia       AS familia,
        'galeria'       AS origen
      FROM product_images pi
      JOIN products p ON p.id = pi.product_id
      WHERE pi.url IS NOT NULL AND pi.url <> ''

      ORDER BY familia, label
    `,
    getUploadedMedia(),
  ]);

  const productImages = productRows.map((r: Record<string, unknown>) => ({
    url: String(r.url),
    label: String(r.label),
    familia: String(r.familia),
    origen: String(r.origen),
  }));

  // Deduplicate product images by URL
  const seen = new Set<string>();
  const unique = productImages.filter((img) => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });

  // Uploaded media — newest first, separate section
  const uploadedImages = uploaded
    .filter((m) => !seen.has(m.url))
    .map((m) => ({
      url: m.url,
      label: m.filename,
      familia: '',
      origen: 'upload' as const,
      sizeKb: Math.round(m.size_bytes / 1024),
    }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1a1f2a]">
          Biblioteca de medios
          <span className="ml-2 text-[#9ca3af] font-normal text-[16px]">
            ({unique.length + uploadedImages.length})
          </span>
        </h1>
        <p className="text-[13px] text-[#9ca3af] mt-1">
          Haz clic en una imagen para copiar su URL. Las imágenes subidas se convierten a WebP automáticamente.
        </p>
      </div>
      <MediaGallery productImages={unique} uploadedImages={uploadedImages} />
    </div>
  );
}
