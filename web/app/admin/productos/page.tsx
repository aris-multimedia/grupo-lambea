import { sql } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ProductListClient } from './ProductListClient';

export default async function AdminProductos() {
  const rows = await sql`
    SELECT id, slug, familia, nombre, aplicaciones, precio_desde, publicado, bestseller, imagen
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
    publicado: Boolean(p.publicado),
    bestseller: Boolean(p.bestseller),
    imagen: p.imagen ? String(p.imagen) : null,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[#1a1f2a]">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-[#1E92D8] hover:bg-[#1370A8] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors no-underline"
        >
          <Plus size={14} />
          Nuevo producto
        </Link>
      </div>

      <ProductListClient productos={productos} />
    </div>
  );
}
