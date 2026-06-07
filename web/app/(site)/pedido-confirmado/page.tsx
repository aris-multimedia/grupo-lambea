import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Phone, Mail } from 'lucide-react';

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido } = await searchParams;
  if (!pedido) redirect('/');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--success)]/10 mb-6">
          <CheckCircle size={40} className="text-[var(--success)]" strokeWidth={1.8} />
        </div>

        <h1 className="text-[30px] font-semibold text-[var(--ink)] mb-3">
          ¡Pedido confirmado!
        </h1>

        {pedido && (
          <div className="inline-flex items-center gap-2 bg-[var(--blue-soft)] text-[var(--blue-deep)] text-[14px] font-semibold px-5 py-2 rounded-full mb-6">
            <Package size={15} />
            Número de pedido: {pedido}
          </div>
        )}

        <p className="text-[15px] text-[var(--ink-500)] leading-relaxed mb-8">
          Hemos recibido tu pedido. Te enviaremos un email de confirmación con los datos de pago por <strong className="text-[var(--ink)]">transferencia bancaria o Bizum</strong>.
        </p>

        <div
          className="rounded-xl p-5 mb-8 text-left space-y-3"
          style={{ background: 'var(--blue-soft)', border: '1px solid rgba(30,146,216,0.15)' }}
        >
          <div className="text-[13px] font-semibold text-[var(--blue-deep)] mb-3">¿Tienes dudas?</div>
          <a
            href="tel:+34637916345"
            className="flex items-center gap-2.5 text-[14px] text-[var(--ink-700)] hover:text-[var(--blue)] no-underline transition-colors"
          >
            <Phone size={15} className="text-[var(--blue)]" />
            637 916 345
          </a>
          <a
            href="mailto:francisco@grupolambea.com"
            className="flex items-center gap-2.5 text-[14px] text-[var(--ink-700)] hover:text-[var(--blue)] no-underline transition-colors"
          >
            <Mail size={15} className="text-[var(--blue)]" />
            francisco@grupolambea.com
          </a>
        </div>

        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 bg-[var(--blue)] hover:bg-[var(--blue-dark)] text-white no-underline px-7 py-3 rounded-[10px] font-semibold text-[15px] transition-colors"
        >
          Seguir comprando
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
