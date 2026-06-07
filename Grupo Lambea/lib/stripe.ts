import 'server-only'
import Stripe from 'stripe'

// Cliente de Stripe. La clave SIEMPRE desde el entorno (nunca hardcodeada).
// apiVersion se omite → usa la versión por defecto de la cuenta.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
