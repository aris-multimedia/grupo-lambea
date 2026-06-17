'use client';

import React from 'react';
import { Search } from 'lucide-react';

/* Primitivas de formulario y toolbar del admin. Reutilizadas por
   ProductEditForm, AjustesForm y los listados. La "Card con cabecera"
   (Section) vive en ./layout para poder usarse también desde Server
   Components — aquí se re-exporta para no romper imports existentes. */

export { Section } from './layout';

export const inputClass =
  'w-full border border-[#d7dde6] rounded-(--r-sm) px-3.5 py-2.5 text-[14px] text-(--ink) outline-none focus:border-(--blue) focus:ring-2 focus:ring-[rgba(30,146,216,0.14)] transition-colors bg-white';

export const labelClass =
  'block text-[12px] font-semibold uppercase tracking-wider text-(--ink-500) mb-2';

export function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {help && <p className="text-[11px] text-(--ink-500) mt-1.5">{help}</p>}
    </div>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-(--r-sm) border transition-colors text-left cursor-pointer"
      style={
        checked
          ? { borderColor: 'var(--blue)', background: 'rgba(30,146,216,0.06)' }
          : { borderColor: 'var(--line)', background: '#fff' }
      }
    >
      <span
        className="w-9 h-5 rounded-full relative transition-colors shrink-0"
        style={{ background: checked ? 'var(--blue)' : '#c8cfda' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
          style={{ left: checked ? 'calc(100% - 18px)' : '2px' }}
        />
      </span>
      <span>
        <span className="block text-[13px] font-medium text-(--ink)">{label}</span>
        {description && <span className="block text-[11px] text-(--ink-500)">{description}</span>}
      </span>
    </button>
  );
}

/* ── Toolbar compartida ─────────────────────────────────────────────── */

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  className = 'w-64',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--ink-500) pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 border border-[#d7dde6] rounded-(--r-sm) text-[13px] text-(--ink) outline-none focus:border-(--blue) focus:ring-2 focus:ring-[rgba(30,146,216,0.14)] transition-colors bg-white"
      />
    </div>
  );
}

export interface SegmentedOption {
  key: string;
  label: string;
  count?: number;
  Icon?: React.FC<{ size?: number }>;
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-white rounded-(--r-sm) border border-(--line) p-1 w-fit">
      {options.map(({ key, label, count, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
            style={active ? { background: 'var(--blue)', color: '#fff' } : { background: 'transparent', color: 'var(--ink-500)' }}
          >
            {Icon && <Icon size={14} />}
            {label}
            {count != null && <span className="text-[11px] opacity-60 font-normal">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
