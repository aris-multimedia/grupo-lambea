'use client';

import { useState, useRef } from 'react';
import { updateProduct } from '@/app/actions/products';
import {
  Save, ArrowLeft, Plus, Trash2, ExternalLink, ChevronUp, ChevronDown,
  FileText, Tag, Layers, BookOpen, Images,
} from 'lucide-react';
import Link from 'next/link';
import { Section, Field, Toggle, inputClass } from '../../_components/ui';

interface ProductData {
  id: number;
  slug: string;
  nombre: string;
  familia: string;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  instrucciones_uso: string | null;
  codigo_toxicologia: string | null;
  imagen: string | null;
  ficha_tecnica_url: string | null;
  precio_desde: number | null;
  precio_hasta: number | null;
  publicado: boolean;
  bestseller: boolean;
  promo_3x2: boolean;
  aplicaciones: string[];
  formatos: string[];
  usos: string[];
  caracteristicas: string[];
  wc_id: number | null;
  valoracion: number | null;
  num_valoraciones: number | null;
}

interface Variant {
  id: number | null;
  formato: string;
  precio: number | null;
  imagen_url: string | null;
  orden: number;
}

interface GalleryImage {
  url: string;
  alt: string;
}

interface Document {
  tipo: string;
  idioma: string;
  url: string;
}

const APLICACIONES = [
  { key: 'nautico', label: 'Náutico' },
  { key: 'caravaning', label: 'Caravaning' },
  { key: 'industrial', label: 'Industrial' },
];

export function ProductEditForm({
  product,
  variants: initialVariants,
  documents,
  galleryImages: initialGallery,
}: {
  product: ProductData;
  variants: Variant[];
  documents: Document[];
  galleryImages: GalleryImage[];
}) {
  const action = updateProduct.bind(null, product.slug);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [publicado, setPublicado] = useState(product.publicado);
  const [bestseller, setBestseller] = useState(product.bestseller);
  const [promo3x2, setPromo3x2] = useState(product.promo_3x2);
  const [aplicaciones, setAplicaciones] = useState<string[]>(product.aplicaciones);
  const [imagen, setImagen] = useState(product.imagen ?? '');
  const [fichaUrl, setFichaUrl] = useState(product.ficha_tecnica_url ?? '');
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const formRef = useRef<HTMLFormElement>(null);

  function toggleAplicacion(key: string) {
    setAplicaciones((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { id: null, formato: '', precio: null, imagen_url: null, orden: prev.length },
    ]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof Variant, value: string | number | null) {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  }

  function moveVariant(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= variants.length) return;
    setVariants((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function addImage() {
    setGallery((prev) => [...prev, { url: '', alt: '' }]);
  }

  function removeImage(idx: number) {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateImage(idx: number, field: keyof GalleryImage, value: string) {
    setGallery((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, [field]: value } : img))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    formData.set('publicado', publicado ? 'true' : 'false');
    formData.set('bestseller', bestseller ? 'true' : 'false');
    formData.set('promo_3x2', promo3x2 ? 'true' : 'false');
    formData.set('aplicaciones', aplicaciones.join(', '));
    formData.set('imagen', imagen);
    formData.set('ficha_tecnica_url', fichaUrl);
    formData.set(
      'variants_json',
      JSON.stringify(variants.map((v, i) => ({ ...v, orden: i })))
    );
    formData.set('gallery_json', JSON.stringify(gallery.filter((img) => img.url.trim())));

    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('NEXT_REDIRECT')) {
        setError('Error al guardar. Inténtalo de nuevo.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* ── STICKY HEADER ─────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#e5e7eb] -mx-6 lg:-mx-10 -mt-8 mb-6 px-6 lg:px-10 py-4 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/productos"
              className="inline-flex items-center gap-1.5 text-[#6b7280] hover:text-[#1a1f2a] text-[13px] no-underline transition-colors"
            >
              <ArrowLeft size={14} />
              Productos
            </Link>
            <div className="w-px h-5 bg-[#e5e7eb]" />
            <div>
              <span className="text-[15px] font-semibold text-[#1a1f2a]">{product.nombre}</span>
              <span className="ml-2 text-[11px] text-[#c4c9d4] font-mono">{product.slug}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/tienda/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[#9ca3af] hover:text-[#374151] text-[13px] no-underline transition-colors"
            >
              <ExternalLink size={13} />
              Ver en tienda
            </Link>
            {error && <span className="text-[12px] text-red-600 font-medium">{error}</span>}
            {saved && <span className="text-[12px] text-[#6b7280] font-medium">✓ Guardado</span>}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 bg-[#1E92D8] hover:bg-[#1370A8] disabled:opacity-60 text-white font-semibold text-[13px] px-5 py-2 rounded-lg transition-colors"
            >
              <Save size={14} />
              {pending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_280px]">
          {/* ── LEFT ──────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Información básica */}
            <Section icon={<BookOpen size={14} />} title="Información básica">
              <div className="space-y-4">
                <Field label="Nombre del producto *">
                  <input name="nombre" defaultValue={product.nombre} required className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Familia">
                    <input
                      value={product.familia}
                      readOnly
                      className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[14px] bg-[#f9fafb] text-[#9ca3af] cursor-not-allowed"
                    />
                  </Field>
                  <Field label="Código toxicología">
                    <input
                      name="codigo_toxicologia"
                      defaultValue={product.codigo_toxicologia ?? ''}
                      className={inputClass}
                      placeholder="Ej: 180025/LAM"
                    />
                  </Field>
                </div>
                <Field label="Descripción corta">
                  <textarea
                    name="descripcion_corta"
                    defaultValue={product.descripcion_corta ?? ''}
                    rows={2}
                    className={inputClass}
                    placeholder="Resumen breve visible en el listado y buscadores"
                  />
                </Field>
                <Field label="Descripción larga">
                  <textarea
                    name="descripcion_larga"
                    defaultValue={product.descripcion_larga ?? ''}
                    rows={6}
                    className={inputClass}
                    placeholder="Descripción completa del producto"
                  />
                </Field>
                <Field label="Instrucciones de uso">
                  <textarea
                    name="instrucciones_uso"
                    defaultValue={product.instrucciones_uso ?? ''}
                    rows={3}
                    className={inputClass}
                    placeholder="Modo de aplicación, dosis, precauciones…"
                  />
                </Field>
              </div>
            </Section>

            {/* Usos y características */}
            <Section icon={<Tag size={14} />} title="Usos y características">
              <p className="text-[12px] text-[#9ca3af] mb-4">Un ítem por línea</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Usos principales">
                  <textarea
                    name="usos"
                    defaultValue={product.usos.join('\n')}
                    rows={6}
                    className={inputClass}
                    placeholder={"Limpieza de cascos\nEliminación de óxido"}
                  />
                </Field>
                <Field label="Características">
                  <textarea
                    name="caracteristicas"
                    defaultValue={product.caracteristicas.join('\n')}
                    rows={6}
                    className={inputClass}
                    placeholder={"Alta concentración\nBiodegradable"}
                  />
                </Field>
              </div>
            </Section>

            {/* Variantes / Formatos */}
            <Section icon={<Layers size={14} />} title="Variantes y precios">
              <p className="text-[12px] text-[#9ca3af] mb-3">
                Un formato por variante. El orden determina cómo aparecen en la tienda.
              </p>

              {variants.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-[#c4c9d4] border border-dashed border-[#e5e7eb] rounded-lg">
                  Sin variantes. Añade la primera.
                </div>
              ) : (
                <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[20px_16px_1fr_110px_32px] gap-3 px-4 py-2 bg-[#f9fafb] border-b border-[#e5e7eb] text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                    <span>#</span>
                    <span />
                    <span>Formato</span>
                    <span className="text-right">Precio</span>
                    <span />
                  </div>
                  {variants.map((v, idx) => (
                    <VariantRow
                      key={idx}
                      variant={v}
                      idx={idx}
                      total={variants.length}
                      onChange={updateVariant}
                      onRemove={removeVariant}
                      onMove={moveVariant}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addVariant}
                className="mt-3 flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#1a1f2a] transition-colors"
              >
                <Plus size={13} />
                Añadir variante
              </button>
            </Section>

            {/* Galería de imágenes */}
            <Section icon={<Images size={14} />} title="Galería de imágenes">
              <p className="text-[12px] text-[#9ca3af] mb-3">
                Fotos adicionales del producto: antes/después, detalles, modo de uso, etc.
                La imagen principal se gestiona en el panel lateral.
              </p>

              {gallery.length === 0 ? (
                <div className="text-center py-6 text-[13px] text-[#c4c9d4] border border-dashed border-[#e5e7eb] rounded-lg mb-3">
                  Sin imágenes adicionales.
                </div>
              ) : (
                <div className="space-y-2 mb-3">
                  {gallery.map((img, idx) => (
                    <GalleryRow
                      key={idx}
                      image={img}
                      idx={idx}
                      onChange={updateImage}
                      onRemove={removeImage}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addImage}
                className="flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#1a1f2a] transition-colors"
              >
                <Plus size={13} />
                Añadir imagen
              </button>
            </Section>

            {/* Documentos */}
            <Section icon={<FileText size={14} />} title="Documentos">
              <Field label="URL ficha técnica (PDF)">
                <div className="flex gap-2">
                  <input
                    value={fichaUrl}
                    onChange={(e) => setFichaUrl(e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="https://grupolambea.com/assets/..."
                  />
                  {fichaUrl && (
                    <a
                      href={fichaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#d1d5db] text-[13px] text-[#6b7280] hover:border-[#374151] transition-colors no-underline"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </Field>
            </Section>
          </div>

          {/* ── RIGHT: SIDEBAR ──────────────────────────────── */}
          <div className="space-y-5 xl:sticky xl:top-20 self-start">

            {/* Imagen principal */}
            <Section title="Imagen principal">
              <div className="space-y-3">
                {imagen && (
                  <div className="w-full aspect-square rounded-lg border border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-center overflow-hidden p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagen} alt={product.nombre} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <input
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  className={inputClass}
                  placeholder="/assets/productos/nombre.jpg"
                />
                <p className="text-[11px] text-[#9ca3af]">
                  Se muestra en las cards del listado y como imagen destacada.
                </p>
              </div>
            </Section>

            {/* Estado */}
            <Section title="Estado">
              <div className="space-y-2">
                <Toggle label="Publicado" description="Visible en la tienda" checked={publicado} onChange={setPublicado} />
                <Toggle label="Bestseller ★" description="Aparece en la home" checked={bestseller} onChange={setBestseller} />
                <Toggle label="Promo 3×2" description="Incluido en la promoción" checked={promo3x2} onChange={setPromo3x2} />
              </div>
            </Section>

            {/* Categorías */}
            <Section title="Categorías">
              <div className="space-y-1.5">
                {APLICACIONES.map(({ key, label }) => {
                  const active = aplicaciones.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAplicacion(key)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all text-left"
                      style={
                        active
                          ? { borderColor: '#1E92D8', background: 'rgba(30,146,216,0.06)' }
                          : { borderColor: '#e5e7eb', background: '#fff' }
                      }
                    >
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
                        style={
                          active
                            ? { borderColor: '#1E92D8', background: '#1E92D8' }
                            : { borderColor: '#d1d5db', background: '#fff' }
                        }
                      >
                        {active && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-[#374151]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Precio */}
            <Section title="Precios (IVA inc.)">
              <div className="space-y-3">
                <Field label="Desde (€)">
                  <input name="precio_desde" type="text" inputMode="decimal" defaultValue={product.precio_desde != null ? String(product.precio_desde).replace('.', ',') : ''} className={inputClass} placeholder="Auto" />
                </Field>
                <Field label="Hasta (€)">
                  <input name="precio_hasta" type="text" inputMode="decimal" defaultValue={product.precio_hasta != null ? String(product.precio_hasta).replace('.', ',') : ''} className={inputClass} placeholder="Auto" />
                </Field>
                <p className="text-[11px] text-[#9ca3af]">Se calculan del mín/máx de variantes al guardar.</p>
              </div>
            </Section>

            {/* Reseñas */}
            <Section title="Reseñas">
              <div className="space-y-3">
                <Field label="Valoración media (0–5)">
                  <input
                    name="valoracion"
                    type="text"
                    inputMode="decimal"
                    defaultValue={product.valoracion != null ? String(product.valoracion).replace('.', ',') : ''}
                    className={inputClass}
                    placeholder="Ej: 4,8"
                  />
                </Field>
                <Field label="Nº de valoraciones">
                  <input
                    name="num_valoraciones"
                    type="number"
                    min="0"
                    defaultValue={product.num_valoraciones ?? ''}
                    className={inputClass}
                    placeholder="Ej: 124"
                  />
                </Field>
                <p className="text-[11px] text-[#9ca3af]">
                  Se muestran como estrellas en la ficha del producto.
                </p>
              </div>
            </Section>
          </div>
        </div>
      </form>
  );
}

/* ── Sub-components — Section/Field/Toggle se importan de _components/ui ── */

function VariantRow({
  variant,
  idx,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  variant: Variant;
  idx: number;
  total: number;
  onChange: (idx: number, field: keyof Variant, value: string | number | null) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
}) {
  return (
    <div className="border-b border-[#f3f4f6] last:border-0">
      {/* Main row: order, format, price, delete */}
      <div className="grid grid-cols-[20px_16px_1fr_110px_32px] gap-3 items-center px-4 pt-2.5 pb-1.5">
        <span className="text-[12px] text-[#c4c9d4] text-center">{idx + 1}</span>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onMove(idx, -1)}
            disabled={idx === 0}
            className="text-[#d1d5db] hover:text-[#6b7280] disabled:opacity-30 transition-colors leading-none"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => onMove(idx, 1)}
            disabled={idx === total - 1}
            className="text-[#d1d5db] hover:text-[#6b7280] disabled:opacity-30 transition-colors leading-none"
          >
            <ChevronDown size={12} />
          </button>
        </div>
        <input
          value={variant.formato}
          onChange={(e) => onChange(idx, 'formato', e.target.value)}
          className="border-none outline-none text-[13px] text-[#1a1f2a] bg-transparent placeholder-[#d1d5db]"
          placeholder="Ej: 1 L, 750 ml…"
        />
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={variant.precio ?? ''}
            onChange={(e) => {
              const raw = e.target.value.replace(',', '.');
              if (raw === '') { onChange(idx, 'precio', null); return; }
              const n = Number(raw);
              if (Number.isFinite(n)) onChange(idx, 'precio', n);
            }}
            className="w-full border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-[13px] text-right outline-none focus:border-[#1E92D8] transition-colors pr-7 bg-white"
            placeholder="0,00"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-[#9ca3af]">€</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="text-[#d1d5db] hover:text-red-400 transition-colors justify-self-end"
          aria-label="Eliminar variante"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {/* Image row */}
      <div className="flex items-center gap-2 px-4 pb-2.5 pl-[52px]">
        <div className="w-7 h-7 shrink-0 rounded border border-[#e5e7eb] bg-white overflow-hidden flex items-center justify-center">
          {variant.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={variant.imagen_url}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <Images size={11} className="text-[#e5e7eb]" />
          )}
        </div>
        <input
          value={variant.imagen_url ?? ''}
          onChange={(e) => onChange(idx, 'imagen_url', e.target.value || null)}
          className="flex-1 border border-[#e5e7eb] rounded-md px-2.5 py-1 text-[12px] text-[#6b7280] outline-none focus:border-[#1E92D8] transition-colors bg-white"
          placeholder="URL imagen de esta variante (opcional)"
        />
      </div>
    </div>
  );
}

function GalleryRow({
  image,
  idx,
  onChange,
  onRemove,
}: {
  image: GalleryImage;
  idx: number;
  onChange: (idx: number, field: keyof GalleryImage, value: string) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 border border-[#e5e7eb] rounded-lg bg-[#fafafa]">
      {/* Thumbnail */}
      <div className="w-12 h-12 shrink-0 rounded border border-[#e5e7eb] bg-white flex items-center justify-center overflow-hidden">
        {image.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <Images size={16} className="text-[#e5e7eb]" />
        )}
      </div>
      {/* Inputs */}
      <div className="flex-1 flex gap-2 min-w-0">
        <input
          value={image.url}
          onChange={(e) => onChange(idx, 'url', e.target.value)}
          className="flex-1 border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-[12px] outline-none focus:border-[#374151] transition-colors bg-white min-w-0"
          placeholder="URL de la imagen"
        />
        <input
          value={image.alt}
          onChange={(e) => onChange(idx, 'alt', e.target.value)}
          className="w-28 border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-[12px] outline-none focus:border-[#374151] transition-colors bg-white"
          placeholder="Texto alt"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(idx)}
        className="text-[#d1d5db] hover:text-red-400 transition-colors shrink-0"
        aria-label="Eliminar imagen"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
