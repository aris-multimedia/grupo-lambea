import { notFound } from 'next/navigation'
import { getImagePairs } from '@/lib/images'
import { getAllFeedback } from '@/lib/feedback'
import { AdminFilters } from './AdminFilters'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const expected = process.env.ADMIN_TOKEN
  if (!expected || token !== expected) notFound()

  const [pairs, feedbackMap] = await Promise.all([
    Promise.resolve(getImagePairs()),
    getAllFeedback(),
  ])

  // Combinar pairs con feedback para construir rows
  const rows = pairs.map((p) => {
    const f = feedbackMap.get(p.slug)
    return {
      slug: p.slug,
      familia: p.familia,
      categoria: p.categoria,
      estado: f?.estado ?? null,
      comentario: f?.comentario ?? null,
      updated_at: f?.updated_at ? f.updated_at.toISOString() : null,
    }
  })

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-5 py-6">
          <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-1">
            Panel interno · Solo tú
          </div>
          <h1 className="text-[24px] font-semibold text-slate-900">
            Feedback del cliente
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Aquí ves todo lo que el cliente ha marcado y comentado, en tiempo real.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 pt-6">
        <AdminFilters rows={rows} />
      </div>
    </main>
  )
}
