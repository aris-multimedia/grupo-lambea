// Iconos de los métodos de pago aceptados (vía Stripe). Decorativos: dan
// confianza y dejan "todo visible" en la ficha/checkout. Logos como SVG inline
// ligeros (sin dependencias ni imágenes externas).
import { Lock } from 'lucide-react'

function Chip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center h-8 px-2.5 rounded-[var(--r-sm)] bg-white"
      style={{ border: '1px solid var(--line)' }}
    >
      {children}
    </span>
  )
}

const Visa = () => (
  <span style={{ color: '#1434CB', fontStyle: 'italic', fontWeight: 800, fontSize: 13, letterSpacing: '0.02em' }}>VISA</span>
)

const Mastercard = () => (
  <svg viewBox="0 0 38 24" width="30" height="19" aria-hidden="true">
    <circle cx="15" cy="12" r="7" fill="#EB001B" />
    <circle cx="23" cy="12" r="7" fill="#F79E1B" />
    <path d="M19 6.7a7 7 0 0 0 0 10.6 7 7 0 0 0 0-10.6Z" fill="#FF5F00" />
  </svg>
)

const Maestro = () => (
  <svg viewBox="0 0 38 24" width="30" height="19" aria-hidden="true">
    <circle cx="15" cy="12" r="7" fill="#0099DF" />
    <circle cx="23" cy="12" r="7" fill="#ED0006" />
    <path d="M19 6.7a7 7 0 0 0 0 10.6 7 7 0 0 0 0-10.6Z" fill="#6C6BBD" />
  </svg>
)

const Amex = () => (
  <span style={{ background: '#1F72CD', color: '#fff', fontWeight: 800, fontSize: 9, letterSpacing: '0.04em', padding: '2px 4px', borderRadius: 3 }}>AMEX</span>
)

const PayPal = () => (
  <span style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 12.5 }}>
    <span style={{ color: '#003087' }}>Pay</span>
    <span style={{ color: '#0070E0' }}>Pal</span>
  </span>
)

const Bizum = () => (
  <span style={{ color: '#00BACE', fontWeight: 800, fontSize: 12.5, letterSpacing: '-0.01em' }}>Bizum</span>
)

const ApplePay = () => (
  <span className="inline-flex items-center gap-[3px]" style={{ color: '#111', fontWeight: 600, fontSize: 12.5 }}>
    <svg viewBox="0 0 17 20" width="11" height="13" aria-hidden="true" fill="currentColor">
      <path d="M13.62 10.37c-.02-1.7 1.39-2.52 1.45-2.56-.79-1.16-2.02-1.32-2.46-1.34-1.05-.11-2.04.61-2.57.61-.53 0-1.34-.6-2.21-.58-1.14.02-2.19.66-2.77 1.68-1.18 2.05-.3 5.08.85 6.74.56.81 1.23 1.72 2.1 1.69.84-.03 1.16-.54 2.18-.54 1.02 0 1.3.54 2.19.52.9-.01 1.48-.83 2.03-1.64.64-.94.9-1.85.92-1.9-.02-.01-1.76-.68-1.78-2.68ZM11.9 5.48c.47-.57.79-1.36.7-2.15-.68.03-1.5.45-1.98 1.02-.43.5-.81 1.31-.71 2.08.76.06 1.53-.39 1.99-.95Z" />
    </svg>
    Pay
  </span>
)

const GooglePay = () => (
  <span className="inline-flex items-center gap-[3px]" style={{ fontWeight: 600, fontSize: 12.5 }}>
    <span style={{ color: '#4285F4' }}>G</span>
    <span style={{ color: '#5F6368' }}>Pay</span>
  </span>
)

/**
 * Fila de métodos de pago. `withSecureNote` muestra arriba el aviso de "pago
 * seguro". Reutilizable en ficha de producto, carrito y checkout.
 */
export function PaymentMethods({ withSecureNote = true }: { withSecureNote?: boolean }) {
  const methods: { key: string; label: string; Logo: () => React.ReactElement }[] = [
    { key: 'visa', label: 'Visa', Logo: Visa },
    { key: 'mastercard', label: 'Mastercard', Logo: Mastercard },
    { key: 'maestro', label: 'Maestro', Logo: Maestro },
    { key: 'amex', label: 'American Express', Logo: Amex },
    { key: 'paypal', label: 'PayPal', Logo: PayPal },
    { key: 'bizum', label: 'Bizum', Logo: Bizum },
    { key: 'applepay', label: 'Apple Pay', Logo: ApplePay },
    { key: 'googlepay', label: 'Google Pay', Logo: GooglePay },
  ]
  return (
    <div>
      {withSecureNote && (
        <div className="flex items-center gap-2 text-[12px] text-[var(--ink-500)] font-medium mb-3">
          <Lock size={14} className="text-[var(--blue)]" />
          Pago 100% seguro con cifrado bancario
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {methods.map(({ key, label, Logo }) => (
          <Chip key={key} label={label}>
            <Logo />
          </Chip>
        ))}
      </div>
    </div>
  )
}
