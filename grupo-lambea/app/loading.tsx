// Loading global: spinner discreto con la marca mientras carga la ruta.
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" role="status" aria-label="Cargando">
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '3px solid var(--line)', borderTopColor: 'var(--blue)' }}
      />
      <span className="text-[13px] text-(--ink-500)">Cargando…</span>
    </div>
  )
}
