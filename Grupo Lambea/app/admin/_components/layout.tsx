import React from 'react';

/* Primitivas de layout del admin, server-safe (sin 'use client').
   Unifican la cabecera de página y las "cards" que antes estaban
   duplicadas como Section / Panel en varias pantallas.
   Usan los tokens de marca de globals.css (--blue, --ink, --line…)
   y Lora en los títulos para que el panel se sienta como la web. */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="font-(family-name:--font-lora) text-[26px] leading-tight font-semibold text-(--ink)">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13.5px] text-(--ink-500) mt-1.5 max-w-[70ch]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  icon,
  description,
  action,
  children,
  padded = true,
  className = '',
}: {
  title?: string;
  icon?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Pone padding interno. Desactívalo para tablas/listas a sangre. */
  padded?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`bg-white rounded-(--r-md) border border-(--line) overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-(--line-soft) flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon && <span className="text-(--ink-500) shrink-0">{icon}</span>}
              <h2 className="text-[13.5px] font-semibold text-(--ink) truncate">{title}</h2>
            </div>
            {description && (
              <p className="text-[12px] text-(--ink-500) mt-1">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/* Alias semántico: en los formularios la "Card con cabecera" se llama Section. */
export { Card as Section };

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-12 text-center text-[13.5px] text-(--ink-500)">{children}</div>
  );
}

/* Pill de estado reutilizable (pedidos, publicado/oculto…). */
export function StatusPill({
  label,
  color,
  bg,
  className = '',
}: {
  label: string;
  color: string;
  bg: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-(--r-pill) whitespace-nowrap ${className}`}
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}

/* Metadatos de estado de pedido — fuente única usada por dashboard,
   listado y detalle de pedidos. */
export const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  nuevo: { label: 'Nuevo', color: '#1d4ed8', bg: '#eff6ff' },
  confirmado: { label: 'Confirmado', color: '#065f46', bg: '#ecfdf5' },
  enviado: { label: 'Enviado', color: '#92400e', bg: '#fffbeb' },
  entregado: { label: 'Entregado', color: '#155e75', bg: '#ecfeff' },
  completado: { label: 'Completado', color: '#3730a3', bg: '#eef2ff' },
  cancelado: { label: 'Cancelado', color: '#991b1b', bg: '#fef2f2' },
  reembolsado: { label: 'Reembolsado', color: '#6b7280', bg: '#f3f4f6' },
};

export function orderBadge(estado: string) {
  return ORDER_STATUS[estado] ?? { label: estado, color: '#3A4250', bg: '#f3f4f6' };
}
