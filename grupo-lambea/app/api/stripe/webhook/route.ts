import type { NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { convertPendingToOrder, markRefundedByPaymentIntent } from '@/lib/checkout'

// Webhook de Stripe (respaldo de la confirmación). En local no hace falta: la
// página de confirmación ya verifica el pago. En producción, configurar el
// endpoint en Stripe y guardar STRIPE_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!secret || !sig) {
    return new Response('webhook no configurado', { status: 200 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('[stripe-webhook] firma inválida:', err)
    return new Response('firma inválida', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.pending_id && session.payment_status === 'paid') {
        const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
        await convertPendingToOrder(session.metadata.pending_id, pi)
      }
    } else if (event.type === 'charge.refunded') {
      // Reembolso hecho desde el panel de Stripe → reflejarlo en el pedido (estado 'reembolsado').
      const charge = event.data.object as Stripe.Charge
      const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (pi) await markRefundedByPaymentIntent(pi)
    }
  } catch (err) {
    console.error('[stripe-webhook] error procesando', event.type, err)
    return new Response('error', { status: 500 }) // Stripe reintentará
  }

  return new Response('ok', { status: 200 })
}
