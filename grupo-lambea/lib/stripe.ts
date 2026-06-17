import 'server-only'
import Stripe from 'stripe'

// Cliente de Stripe PEREZOSO. La clave SIEMPRE desde el entorno (nunca
// hardcodeada). No se instancia al importar el módulo: hacerlo con la clave
// vacía rompía el build (`new Stripe('')` lanza "Neither apiKey nor
// config.authenticator provided" al recolectar datos de página). Se crea en el
// primer uso real, en tiempo de ejecución. apiVersion se omite → usa la
// versión por defecto de la cuenta.
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY no está configurada')
    _stripe = new Stripe(key)
  }
  return _stripe
}

// Proxy que difiere la creación del cliente hasta el primer acceso a una
// propiedad (p. ej. `stripe.checkout`, `stripe.webhooks`). Así el import es
// seguro en build y el cliente solo se construye cuando se usa de verdad.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe()
    const value = Reflect.get(client as object, prop)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
