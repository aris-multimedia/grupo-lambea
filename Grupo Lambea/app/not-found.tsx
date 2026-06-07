import Link from 'next/link'
import Image from 'next/image'
import { Home, Search, Phone } from 'lucide-react'

// 404 con marca. Renderiza bajo el layout raíz (sin cabecera/pie de tienda),
// así que es autocontenida: logo + rutas de recuperación. Captura tanto las URLs
// inexistentes como los notFound() de fichas no publicadas.
export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <Link href="/" className="mb-9 no-underline" aria-label="Grupo Lambea — inicio">
        <Image src="/logo.png" alt="Grupo Lambea" width={180} height={63} className="h-12 w-auto" priority />
      </Link>

      <div
        className="font-(family-name:--font-lora) text-(--blue-deep) font-semibold leading-none"
        style={{ fontSize: 'clamp(64px, 12vw, 110px)', letterSpacing: '-0.02em' }}
      >
        404
      </div>

      <h1
        className="font-(family-name:--font-lora) text-(--ink) font-medium mt-4 mb-3"
        style={{ fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.015em' }}
      >
        No hemos encontrado esta página
      </h1>
      <p className="text-[15px] text-(--ink-500) max-w-md leading-relaxed mb-9">
        Puede que el enlace haya cambiado o que el producto ya no esté disponible.
        Te dejamos algunas rutas para seguir.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-(--blue) text-white no-underline font-semibold text-[14px] px-6 py-3 rounded-[10px] hover:bg-(--blue-dark) transition-colors"
        >
          <Home size={16} /> Ir al inicio
        </Link>
        <Link
          href="/tienda/nautico"
          className="inline-flex items-center gap-2 bg-white text-(--blue-deep) no-underline font-semibold text-[14px] px-6 py-3 rounded-[10px] border border-(--line) hover:border-(--blue) transition-colors"
        >
          <Search size={16} /> Ver el catálogo
        </Link>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 text-(--ink-700) no-underline font-semibold text-[14px] px-6 py-3 rounded-[10px] hover:text-(--blue) transition-colors"
        >
          <Phone size={16} /> Contacto
        </Link>
      </div>
    </main>
  )
}
