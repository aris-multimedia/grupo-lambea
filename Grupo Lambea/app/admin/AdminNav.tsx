'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ShoppingCart, LayoutDashboard, Image, Settings } from 'lucide-react'

const NAV: { href: string; label: string; Icon: React.FC<{ size?: number; style?: React.CSSProperties }>; exact?: boolean; badgeKey?: 'nuevos' }[] = [
  { href: '/admin',           label: 'Escritorio', Icon: LayoutDashboard, exact: true },
  { href: '/admin/productos', label: 'Productos',  Icon: Package },
  { href: '/admin/media',     label: 'Medios',     Icon: Image },
  { href: '/admin/pedidos',   label: 'Pedidos',    Icon: ShoppingCart, badgeKey: 'nuevos' },
  { href: '/admin/ajustes',   label: 'Ajustes',    Icon: Settings },
]

export function AdminNav({ nuevosCount = 0 }: { nuevosCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 py-3 px-3 space-y-0.5">
      {NAV.map(({ href, label, Icon, exact, badgeKey }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        const showBadge = badgeKey === 'nuevos' && nuevosCount > 0
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-(--r-sm) text-[13.5px] no-underline font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
            style={
              isActive
                ? { color: '#fff', background: 'rgba(255,255,255,0.14)' }
                : { color: 'rgba(255,255,255,0.72)' }
            }
          >
            <Icon size={17} style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }} />
            {label}
            {showBadge && (
              <span
                className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white rounded-full"
                style={{ background: 'var(--warning)' }}
              >
                {nuevosCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
