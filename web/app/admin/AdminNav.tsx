'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ShoppingCart, LayoutDashboard, Image } from 'lucide-react'

const NAV: { href: string; label: string; Icon: React.FC<{ size?: number; style?: React.CSSProperties }>; exact?: boolean }[] = [
  { href: '/admin',           label: 'Inicio',    Icon: LayoutDashboard, exact: true },
  { href: '/admin/productos', label: 'Productos', Icon: Package },
  { href: '/admin/media',     label: 'Medios',    Icon: Image },
  { href: '/admin/pedidos',   label: 'Pedidos',   Icon: ShoppingCart },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
      {NAV.map(({ href, label, Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors no-underline font-medium"
            style={
              isActive
                ? { color: '#1E92D8', background: 'rgba(30,146,216,0.08)' }
                : { color: '#374151' }
            }
          >
            <Icon
              size={15}
              style={{ color: isActive ? '#1E92D8' : '#9ca3af' }}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
