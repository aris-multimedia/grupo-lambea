import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductEditForm } from './ProductEditForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rows = await sql`
    SELECT id, slug, familia, nombre, descripcion_corta, descripcion_larga,
           instrucciones_uso, codigo_toxicologia, imagen,
           precio_desde, precio_hasta, publicado, bestseller, promo_3x2,
           aplicaciones, formatos, usos, caracteristicas, wc_id,
           valoracion, num_valoraciones
    FROM products
    WHERE slug = ${slug}
    LIMIT 1
  `;

  if (!rows[0]) notFound();
  const p = rows[0] as Record<string, unknown>;

  const variants = await sql`
    SELECT id, formato, precio, imagen_url, orden, stock, peso_gramos
    FROM product_variants
    WHERE product_id = ${Number(p.id)}
    ORDER BY orden, id
  `;

  const documents = await sql`
    SELECT tipo, idioma, url
    FROM product_documents
    WHERE product_id = ${Number(p.id)}
    ORDER BY tipo, idioma
  `;

  const galleryRows = await sql`
    SELECT url, alt, orden
    FROM product_images
    WHERE product_id = ${Number(p.id)}
    ORDER BY orden, id
  `.catch(() => []);

  const product = {
    id: Number(p.id),
    slug: String(p.slug),
    nombre: String(p.nombre),
    familia: String(p.familia),
    descripcion_corta: p.descripcion_corta ? String(p.descripcion_corta) : null,
    descripcion_larga: p.descripcion_larga ? String(p.descripcion_larga) : null,
    instrucciones_uso: p.instrucciones_uso ? String(p.instrucciones_uso) : null,
    codigo_toxicologia: p.codigo_toxicologia ? String(p.codigo_toxicologia) : null,
    imagen: p.imagen ? String(p.imagen) : null,
    precio_desde: p.precio_desde != null ? Number(p.precio_desde) : null,
    precio_hasta: p.precio_hasta != null ? Number(p.precio_hasta) : null,
    publicado: Boolean(p.publicado),
    bestseller: Boolean(p.bestseller),
    promo_3x2: Boolean(p.promo_3x2),
    aplicaciones: (p.aplicaciones as string[]) ?? [],
    formatos: (p.formatos as string[]) ?? [],
    usos: (p.usos as string[]) ?? [],
    caracteristicas: (p.caracteristicas as string[]) ?? [],
    wc_id: p.wc_id != null ? Number(p.wc_id) : null,
    valoracion: p.valoracion != null ? Number(p.valoracion) : null,
    num_valoraciones: p.num_valoraciones != null ? Number(p.num_valoraciones) : null,
  };

  const variantList = variants.map((v: Record<string, unknown>) => ({
    id: Number(v.id),
    formato: String(v.formato),
    precio: v.precio != null ? Number(v.precio) : null,
    imagen_url: v.imagen_url ? String(v.imagen_url) : null,
    orden: Number(v.orden ?? 0),
    stock: v.stock != null ? Number(v.stock) : 0,
    peso_gramos: v.peso_gramos != null ? Number(v.peso_gramos) : null,
  }));

  const galleryImages = (galleryRows as Record<string, unknown>[]).map((r) => ({
    url: String(r.url),
    alt: r.alt ? String(r.alt) : '',
  }));

  const documentList = documents.map((d: Record<string, unknown>) => ({
    tipo: String(d.tipo),
    idioma: String(d.idioma),
    url: String(d.url),
  }));

  // Derive ficha_tecnica_url from documents (tipo = 'ficha_tecnica' or 'ficha-tecnica')
  const fichaDoc = documentList.find((d) =>
    d.tipo.toLowerCase().replace(/-/g, '_') === 'ficha_tecnica'
  );
  const fichaUrl = fichaDoc?.url ?? null;

  return (
    <ProductEditForm
      product={{ ...product, ficha_tecnica_url: fichaUrl }}
      variants={variantList}
      galleryImages={galleryImages}
    />
  );
}
