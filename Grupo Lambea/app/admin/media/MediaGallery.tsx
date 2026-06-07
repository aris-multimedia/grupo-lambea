'use client';

import { useRef, useState } from 'react';
import { Copy, Check, X, Upload, ImagePlus, Loader2, ArrowDown, Trash2 } from 'lucide-react';
import { SearchInput } from '../_components/ui';

interface MediaItem {
  url: string;
  label: string;
  familia: string;
  origen: string;
  sizeKb?: number;
}

interface UploadResult {
  url: string;
  originalKb: number;
  processedKb: number;
  label: string;
}

interface Props {
  productImages: MediaItem[];
  uploadedImages: MediaItem[];
}

export function MediaGallery({ productImages, uploadedImages: initialUploaded }: Props) {
  const [uploaded, setUploaded] = useState<MediaItem[]>(initialUploaded);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Per-image load tracking
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allImages = [...uploaded, ...productImages];

  const filtered = search.trim()
    ? allImages.filter(
        (img) =>
          img.label.toLowerCase().includes(search.toLowerCase()) ||
          img.familia.toLowerCase().includes(search.toLowerCase()) ||
          img.url.toLowerCase().includes(search.toLowerCase())
      )
    : allImages;

  function markLoaded(url: string) {
    setLoadedUrls((prev) => new Set([...prev, url]));
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Delete (uploaded media only) ─────────────────────────────────────
  async function handleDelete(item: MediaItem) {
    if (item.origen !== 'upload' || deleting) return;
    if (!window.confirm(`¿Eliminar "${item.label}"? Esta acción no se puede deshacer.`)) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Error al eliminar (${res.status})`);
      setUploaded((prev) => prev.filter((m) => m.url !== item.url));
      setSelected(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Error al eliminar la imagen');
    } finally {
      setDeleting(false);
    }
  }

  const filename = (url: string) => url.split('/').pop() ?? url;

  // Serve a lightweight optimized thumbnail via Next's image optimizer instead of
  // the full-resolution original (product photos from the old site are several MB
  // each, which made the grid slow and the images look pixelated while loading).
  const thumbSrc = (url: string, w = 384) =>
    url.startsWith('data:') ? url : `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;

  // ── Upload ───────────────────────────────────────────────────────────
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten imágenes.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setLastResult(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Error al subir (${res.status})`);
      if (!data?.url) throw new Error('Respuesta no válida del servidor');

      const newItem: MediaItem = {
        url: data.url,
        label: filename(data.url),
        familia: '',
        origen: 'upload',
        sizeKb: data.processedKb,
      };
      setUploaded((prev) => [newItem, ...prev]);
      setLastResult({ ...data, label: newItem.label });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Drag & drop ──────────────────────────────────────────────────────
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // Total loaded vs total visible
  const totalVisible = filtered.length;
  const totalLoaded = filtered.filter((img) => loadedUrls.has(img.url)).length;
  const allLoaded = totalVisible === 0 || totalLoaded >= totalVisible;

  return (
    <>
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, familia o URL…" className="w-72" />
        {search && (
          <span className="text-[12px] text-[#9ca3af]">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Loading indicator */}
        {!allLoaded && (
          <span className="flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
            <Loader2 size={13} className="animate-spin" />
            Cargando imágenes…
          </span>

        )}

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-(--r-sm) text-[13px] font-semibold text-white bg-blue hover:bg-blue-dark transition-colors disabled:opacity-60 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Subiendo…
            </>
          ) : (
            <>
              <ImagePlus size={14} />
              Subir imagen
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* ── Upload feedback ─────────────────────────────────────── */}
      {uploadError && (
        <div className="mb-4 flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <X size={14} className="shrink-0" />
          {uploadError}
        </div>
      )}
      {lastResult && (
        <div className="mb-4 flex items-center gap-2 text-[13px] text-blue bg-[rgba(30,146,216,0.06)] border border-[rgba(30,146,216,0.2)] rounded-lg px-4 py-2.5">
          <Check size={14} className="shrink-0" />
          <span>
            <strong>{lastResult.label}</strong> subida correctamente ·{' '}
            {lastResult.originalKb} KB
            {lastResult.originalKb !== lastResult.processedKb && (
              <>
                {' '}
                <ArrowDown size={11} className="inline" />{' '}
                {lastResult.processedKb} KB (WebP)
              </>
            )}
          </span>
        </div>
      )}

      {/* ── Drop zone (shown when dragging) ─────────────────────── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className="transition-all"
        style={{
          marginBottom: isDragging ? 0 : undefined,
        }}
      >
        {isDragging && (
          <div className="mb-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue bg-[rgba(30,146,216,0.04)] py-10 text-blue">
            <Upload size={28} strokeWidth={1.5} />
            <span className="text-[14px] font-medium">Suelta la imagen aquí</span>
          </div>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────────────────────── */}
      {/* Invisible drop zone covering the whole grid area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
        }}
        onDrop={onDrop}
      >
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 space-y-3">
          {filtered.map((img) => {
            const isLoaded = loadedUrls.has(img.url);
            const isSelected = selected?.url === img.url;
            return (
              <div
                key={img.url}
                onClick={() => setSelected(img)}
                className="break-inside-avoid rounded-lg overflow-hidden border cursor-pointer transition-all group"
                style={{
                  borderColor: isSelected ? '#1E92D8' : '#e5e7eb',
                  boxShadow: isSelected ? '0 0 0 2px #1E92D8' : 'none',
                }}
              >
                {/* Skeleton shown until image loads */}
                <div className="relative bg-[#f3f4f6]" style={{ minHeight: 80 }}>
                  {!isLoaded && (
                    <div
                      className="absolute inset-0 animate-pulse bg-linear-to-r from-[#f3f4f6] via-[#e9eaec] to-[#f3f4f6]"
                      style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }}
                    />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbSrc(img.url)}
                    alt={img.label}
                    loading="lazy"
                    className="w-full object-cover group-hover:opacity-90 transition-opacity"
                    style={{
                      maxHeight: 200,
                      opacity: isLoaded ? 1 : 0,
                      transition: 'opacity 0.25s ease',
                    }}
                    onLoad={() => markLoaded(img.url)}
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      // If the optimized thumbnail fails, fall back to the original
                      // before giving up — never worse than loading the full image.
                      if (el.dataset.fallback !== '1' && !img.url.startsWith('data:')) {
                        el.dataset.fallback = '1';
                        el.src = img.url;
                        return;
                      }
                      markLoaded(img.url);
                      el.src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="%23f3f4f6"/><text x="50" y="45" text-anchor="middle" fill="%23d1d5db" font-size="11">Error</text></svg>';
                    }}
                  />
                </div>
                <div className="px-2 py-1.5 bg-white">
                  <div className="text-[11px] font-medium text-[#374151] truncate">
                    {img.label}
                  </div>
                  <div className="text-[10px] text-[#9ca3af] truncate">
                    {img.origen === 'upload'
                      ? `WebP · ${img.sizeKb ?? '?'} KB`
                      : img.familia}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-[13px] text-[#9ca3af]">
          No se encontraron imágenes.
        </div>
      )}

      {/* ── Detail panel ──────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="w-80 bg-white h-full flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <span className="text-[13px] font-semibold text-[#1a1f2a]">Detalle de imagen</span>
              <button
                onClick={() => setSelected(null)}
                className="text-[#9ca3af] hover:text-[#1a1f2a] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#f9fafb] flex items-center justify-center p-6 border-b border-[#e5e7eb]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc(selected.url, 640)}
                alt={selected.label}
                className="max-w-full max-h-48 object-contain"
              />
            </div>

            <div className="px-5 py-4 space-y-3 text-[13px] flex-1 overflow-y-auto">
              <Row label="Nombre" value={selected.label} />
              {selected.familia && <Row label="Familia" value={selected.familia} />}
              <Row
                label="Tipo"
                value={
                  selected.origen === 'upload'
                    ? 'Subida'
                    : selected.origen === 'variante'
                    ? 'Variante'
                    : selected.origen === 'galeria'
                    ? 'Galería'
                    : 'Producto'
                }
              />
              {selected.sizeKb != null && (
                <Row label="Tamaño" value={`${selected.sizeKb} KB`} />
              )}
              <Row label="Archivo" value={filename(selected.url)} mono />
            </div>

            <div className="px-5 py-4 border-t border-[#e5e7eb] space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                URL
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={selected.url}
                  className="flex-1 border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12px] font-mono text-[#374151] bg-[#f9fafb] outline-none truncate"
                />
                <button
                  onClick={() => copyUrl(selected.url)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all shrink-0"
                  style={{
                    background: copied ? '#1E92D8' : '#1a1f2a',
                    color: '#fff',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              {selected.origen === 'upload' && (
                <button
                  type="button"
                  onClick={() => handleDelete(selected)}
                  disabled={deleting}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Eliminando…' : 'Eliminar imagen'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#9ca3af] shrink-0">{label}</span>
      <span
        className={`text-[#374151] text-right truncate max-w-40 ${mono ? 'font-mono text-[11px]' : ''}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
