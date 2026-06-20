import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Phone, Mail, XCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/lib/settings';
import { phoneDigits } from '@/lib/settings-schema';
import { confirmOrderBySession } from '@/lib/checkout';
import { ClearCart } from './ClearCart';

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; session_id?: string }>;
}) {
  const { pedido, session_id } = await searchParams;

  if (!session_id && !pedido) redirect('/');

  // Verificamos con Stripe si el pago se completó. Si sí, se crea el pedido real
  // (idempotente). Si no, no se ha creado nada y mostramos aviso.
  let paid = !session_id; // enlaces antiguos sin sesión se tratan como válidos
  let numero = pedido;
  if (session_id) {
    const r = await confirmOrderBySession(session_id);
    paid = r.paid;
    if (r.numeroPedido) numero = r.numeroPedido;
  }

  const { contacto } = await getSettings();
  const t = await getTranslations('confirmado');

  // Pago no completado (cancelado o fallido): no se ha creado ningún pedido.
  if (!paid) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <XCircle size={40} className="text-red-500" strokeWidth={1.8} />
          </div>
          <h1 className="text-[28px] font-semibold text-[var(--ink)] mb-3">{t('pagoNoCompletado')}</h1>
          <p className="text-[15px] text-[var(--ink-500)] leading-relaxed mb-8">
            {t('pagoNoCompletadoTexto')}
          </p>
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 bg-[var(--blue)] hover:bg-[var(--blue-dark)] text-white no-underline px-7 py-3 rounded-[10px] font-semibold text-[15px] transition-colors"
          >
            {t('volverCesta')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <ClearCart />
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--success)]/10 mb-6">
          <CheckCircle size={40} className="text-[var(--success)]" strokeWidth={1.8} />
        </div>

        <h1 className="text-[30px] font-semibold text-[var(--ink)] mb-3">
          {t('pedidoConfirmado')}
        </h1>

        {numero && (
          <div className="inline-flex items-center gap-2 bg-[var(--blue-soft)] text-[var(--blue-deep)] text-[14px] font-semibold px-5 py-2 rounded-full mb-6">
            <Package size={15} />
            {t('numeroPedido')} {numero}
          </div>
        )}

        <p className="text-[15px] text-[var(--ink-500)] leading-relaxed mb-8">
          {t('recibido')}
        </p>

        <div
          className="rounded-xl p-5 mb-8 text-left space-y-3"
          style={{ background: 'var(--blue-soft)', border: '1px solid rgba(30,146,216,0.15)' }}
        >
          <div className="text-[13px] font-semibold text-[var(--blue-deep)] mb-3">{t('tienesDudas')}</div>
          <a
            href={`tel:+${phoneDigits(contacto.telefono)}`}
            className="flex items-center gap-2.5 text-[14px] text-[var(--ink-700)] hover:text-[var(--blue)] no-underline transition-colors"
          >
            <Phone size={15} className="text-[var(--blue)]" />
            {contacto.telefono}
          </a>
          <a
            href={`mailto:${contacto.email}`}
            className="flex items-center gap-2.5 text-[14px] text-[var(--ink-700)] hover:text-[var(--blue)] no-underline transition-colors"
          >
            <Mail size={15} className="text-[var(--blue)]" />
            {contacto.email}
          </a>
        </div>

        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 bg-[var(--blue)] hover:bg-[var(--blue-dark)] text-white no-underline px-7 py-3 rounded-[10px] font-semibold text-[15px] transition-colors"
        >
          {t('seguirComprando')}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
