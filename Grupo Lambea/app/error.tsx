'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Home, RotateCcw } from 'lucide-react'

// Error boundary global. Como not-found.tsx, renderiza bajo el layout raíz
// (sin cabecera/pie de tienda), así que es autocontenido.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <Link href="/" className="mb-9 no-underline" aria-label="Grupo Lambea — inicio">
        <Image src="/logo.png" alt="Grupo Lambea" width={180} height={63} className="h-12 w-auto" priority />
      </Link>

      <h1
        className="font-(family-name:--font-lora) text-(--ink) font-medium mt-4 mb-3"
        style={{ fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.015em' }}
      >
        Algo no ha ido bien
      </h1>
      <p className="text-[15px] text-(--ink-500) max-w-md leading-relaxed mb-9">
        Ha ocurrido un error inesperado. Puedes volver a intentarlo o regresar al inicio;
        si el problema persiste, escríbenos desde la página de contacto.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-(--blue) text-white font-semibold text-[14px] px-6 py-3 rounded-[10px] hover:bg-(--blue-dark) transition-colors cursor-pointer"
        >
          <RotateCcw size={16} /> Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-(--blue-deep) no-underline font-semibold text-[14px] px-6 py-3 rounded-[10px] border border-(--line) hover:border-(--blue) transition-colors"
        >
          <Home size={16} /> Ir al inicio
        </Link>
      </div>
    </main>
  )
}
