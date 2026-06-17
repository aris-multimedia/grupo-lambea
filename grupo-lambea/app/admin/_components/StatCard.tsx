import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  /** Variación porcentual respecto al periodo anterior (ej. 12.5 → +12.5%). */
  trend?: number | null;
  /** Resalta la tarjeta (p. ej. pedidos pendientes). */
  highlight?: boolean;
  href?: string;
}

export function StatCard({ label, value, icon, hint, trend, highlight, href }: StatCardProps) {
  // Solo las tarjetas que son enlace muestran feedback de hover.
  const card = (
    <div
      className={`bg-white rounded-(--r-md) p-5 border h-full ${href ? 'transition-colors group-hover:border-(--blue)' : ''}`}
      style={
        highlight
          ? { borderColor: 'rgba(232,169,60,0.5)', background: 'rgba(232,169,60,0.05)' }
          : { borderColor: 'var(--line)' }
      }
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-(--ink-500) font-medium">{label}</span>
        {icon && <span style={{ color: highlight ? 'var(--warning)' : 'var(--blue)' }}>{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <div className="text-[28px] font-bold text-(--ink) leading-none">{value}</div>
        {trend != null && (
          <span
            className="flex items-center gap-0.5 text-[12px] font-semibold mb-0.5"
            style={{ color: trend >= 0 ? '#15803d' : '#b91c1c' }}
          >
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        {hint && <div className="text-[11px] text-(--ink-500)">{hint}</div>}
        {href && (
          <ArrowRight size={14} className="text-[#c4c9d4] group-hover:text-(--blue) transition-colors ml-auto" />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group no-underline block">
        {card}
      </Link>
    );
  }
  return card;
}
