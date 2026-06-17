'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Check, Loader2 } from 'lucide-react';
import { updatePromo } from '@/app/actions/settings';
import { PROMO_CATALOG, presetFor } from '@/lib/promotions';
import type { ActivePromo, PromoTipo } from '@/lib/settings-schema';
import { Card } from './layout';
import { inputClass, labelClass } from './ui';

export function PromoManager({ initial }: { initial: ActivePromo }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [activa, setActiva] = useState(initial.activa);
  const [tipo, setTipo] = useState<PromoTipo>(initial.tipo);
  const [titulo, setTitulo] = useState(initial.titulo);
  const [descripcion, setDescripcion] = useState(initial.descripcion);
  const [valor, setValor] = useState(initial.valor ? String(initial.valor) : '');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const preset = presetFor(tipo);

  // Al cambiar de tipo, precargamos los textos por defecto de esa promo
  // (solo se guarda la config de la promo activa).
  function pickTipo(next: PromoTipo) {
    if (next === tipo) return;
    const p = presetFor(next);
    setTipo(next);
    setTitulo(p.tituloDefault);
    setDescripcion(p.descripcionDefault);
    setValor(p.valor?.placeholder && next === 'descuento' ? '10' : '');
  }

  function save() {
    setSaving(true);
    setSaved(false);
    startTransition(async () => {
      await updatePromo({ activa, tipo, titulo, descripcion, valor });
      router.refresh();
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <Card
      title="Promociones"
      icon={<Tag size={15} />}
      description="Elige la promoción activa de la tienda. El cambio se refleja al instante en toda la web."
      action={
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue hover:bg-blue-dark disabled:opacity-60 text-white font-semibold text-[13px] px-4 py-1.5 rounded-(--r-sm) transition-colors cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar'}
        </button>
      }
    >
      {/* Toggle maestro */}
      <button
        type="button"
        onClick={() => setActiva((a) => !a)}
        aria-pressed={activa}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-(--r-sm) border transition-colors text-left cursor-pointer mb-5"
        style={
          activa
            ? { borderColor: 'var(--blue)', background: 'rgba(30,146,216,0.06)' }
            : { borderColor: 'var(--line)', background: '#fff' }
        }
      >
        <span>
          <span className="block text-[14px] font-semibold text-(--ink)">
            {activa ? 'Promoción activa' : 'Sin promoción'}
          </span>
          <span className="block text-[12px] text-(--ink-500)">
            {activa ? 'Se muestra en la barra superior y los distintivos de la web.' : 'La web no muestra ninguna promoción.'}
          </span>
        </span>
        <span
          className="w-11 h-6 rounded-full relative transition-colors shrink-0"
          style={{ background: activa ? 'var(--blue)' : '#c8cfda' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
            style={{ left: activa ? 'calc(100% - 22px)' : '2px' }}
          />
        </span>
      </button>

      {/* Selector de tipo */}
      <div className={activa ? '' : 'opacity-50 pointer-events-none'}>
        <label className={labelClass}>Tipo de promoción</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {PROMO_CATALOG.map((p) => {
            const active = tipo === p.tipo;
            return (
              <button
                key={p.tipo}
                type="button"
                onClick={() => pickTipo(p.tipo)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-(--r-sm) border text-left transition-colors cursor-pointer"
                style={
                  active
                    ? { borderColor: 'var(--blue)', background: 'rgba(30,146,216,0.06)' }
                    : { borderColor: 'var(--line)', background: '#fff' }
                }
              >
                <span
                  className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                  style={active ? { borderColor: 'var(--blue)', background: 'var(--blue)' } : { borderColor: '#cbd2dc' }}
                >
                  {active && <Check size={11} className="text-white" />}
                </span>
                <span className="text-[13px] font-medium text-(--ink)">{p.nombre}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[12px] text-(--ink-500) bg-(--bg-soft) border border-(--line) rounded-(--r-sm) px-3 py-2 mb-4">
          {preset.resumen}
        </p>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Título de la promoción</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder={preset.tituloDefault} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputClass} placeholder={preset.descripcionDefault} />
          </div>
          {preset.valor && (
            <div>
              <label className={labelClass}>{preset.valor.label}</label>
              <div className="relative w-40">
                <input
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  inputMode="decimal"
                  className={inputClass}
                  placeholder={preset.valor.placeholder}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-(--ink-500)">{preset.valor.sufijo}</span>
              </div>
            </div>
          )}
        </div>

        {/* Vista previa del banner */}
        {titulo && (
          <div className="mt-5 rounded-(--r-sm) overflow-hidden border border-(--line)">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-(--ink-500) px-3 pt-2">Vista previa de la barra superior</div>
            <div className="px-3 py-2 m-2 rounded-(--r-sm) text-[12.5px] text-white text-center" style={{ background: 'var(--blue-deep)' }}>
              <strong style={{ color: '#B3DEF2' }}>{titulo}</strong>
              {descripcion ? ` — ${descripcion}` : ''}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
