import { sql } from '@/lib/db';
import { ProductListClient } from './ProductListClient';
import { PageHeader } from '../_components/layout';

export default async function AdminProductos() {
  const rows = await sql`
    SELECT id, slug, familia, nombre, aplicaciones,
           precio_desde, precio_hasta, publicado, bestseller, promo_3x2, imagen
    FROM products
    ORDER BY familia, nombre
  `;

  const productos = rows.map((p: Record<string, unknown>) => ({
    id: Number(p.id),
    slug: String(p.slug),
    familia: String(p.familia),
    nombre: String(p.nombre),
    aplicaciones: (p.aplicaciones as string[]) ?? [],
    precio_desde: p.precio_desde != null ? Number(p.precio_desde) : null,
    precio_hasta: p.precio_hasta != null ? Number(p.precio_hasta) : null,
    publicado: Boolean(p.publicado),
    bestseller: Boolean(p.bestseller),
    promo_3x2: Boolean(p.promo_3x2),
    imagen: p.imagen ? String(p.imagen) : null,
  }));

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Tu catálogo. Haz clic en cualquier producto para editar su contenido, precios y promoción."
      />
      <ProductListClient productos={productos} />
    </div>
  );
}
