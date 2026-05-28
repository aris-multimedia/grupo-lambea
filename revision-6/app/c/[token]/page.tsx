import { notFound } from 'next/navigation'
import { getImagePairs } from '@/lib/images'
import { getAllFeedback } from '@/lib/feedback'
import { ImageReviewCard } from './ImageReviewCard'
import { SaveToast } from './SaveToast'

export const dynamic = 'force-dynamic'

export default async function ClientReviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const expected = process.env.CLIENT_TOKEN
  if (!expected || token !== expected) notFound()

  const [pairs, feedbackMap] = await Promise.all([
    Promise.resolve(getImagePairs()),
    getAllFeedback(),
  ])

  // Resumen rápido
  let aprobadas = 0
  let mejorar = 0
  let rehacer = 0
  let pendientes = 0
  for (const p of pairs) {
    const f = feedbackMap.get(p.slug)
    if (!f?.estado) pendientes++
    else if (f.estado === 'aprobado') aprobadas++
    else if (f.estado === 'mejorar') mejorar++
    else if (f.estado === 'rehacer') rehacer++
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header sticky */}
      <header
        className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200"
        style={{ WebkitBackdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4">
          <h1 className="text-[18px] font-semibold text-slate-900 leading-tight">
            Revisión de imágenes antes / después
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {pairs.length} parejas para revisar · Tus cambios se guardan automáticamente
          </p>
          {/* Progreso */}
          <div className="flex items-center gap-3 mt-3 text-[12px] flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {aprobadas} aprobadas
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> {mejorar} mejorar
            </span>
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500" /> {rehacer} rehacer
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> {pendientes} pendientes
            </span>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-5 pt-8 pb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="text-[15px] font-semibold text-slate-900 mb-2">
            ¿Cómo funciona?
          </h2>
          <p className="text-[13.5px] text-slate-700 leading-relaxed mb-3">
            Cada tarjeta muestra una pareja antes / después generada para un producto concreto.
            Arrastra la barra para comparar. Marca uno de los tres estados y escribe un comentario
            si quieres detallar algo. <strong>No tienes que enviar nada</strong> — los cambios se
            guardan solos.
          </p>
          <div className="grid grid-cols-3 gap-2 text-[12px] mt-3">
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
              <strong className="text-emerald-700">Aprobado</strong>
              <p className="text-slate-500 mt-0.5">La imagen sirve tal cual</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
              <strong className="text-amber-700">Mejorar</strong>
              <p className="text-slate-500 mt-0.5">Casi bien, ajustes menores</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
              <strong className="text-red-700">Rehacer</strong>
              <p className="text-slate-500 mt-0.5">No sirve, hay que partir de cero</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de tarjetas */}
      <div className="max-w-3xl mx-auto px-5 space-y-5">
        {pairs.map((pair, i) => {
          const f = feedbackMap.get(pair.slug)
          return (
            <ImageReviewCard
              key={pair.slug}
              token={token}
              slug={pair.slug}
              familia={pair.familia}
              categoria={pair.categoria}
              index={i}
              total={pairs.length}
              initialEstado={f?.estado ?? null}
              initialComentario={f?.comentario ?? ''}
            />
          )
        })}
      </div>

      <footer className="max-w-3xl mx-auto px-5 mt-10 text-center text-[12px] text-slate-400">
        Cuando termines, simplemente cierra esta pestaña. Todo está guardado.
      </footer>

      {/* Toast global flotante (feedback de auto-guardado) */}
      <SaveToast />
    </main>
  )
}
