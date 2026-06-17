'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sql } from '@/lib/db';
import type { CartItem } from '@/types/product';
import { getSettings } from '@/lib/settings';
import { promoDiscount } from '@/lib/promotions';
import Stripe from 'stripe';
import { stripe, stripeConfigured } from '@/lib/stripe';
import { priceCart } from '@/lib/checkout';
import { issueInvoiceForOrder } from '@/lib/invoicing';
import { restoreStockForOrder } from '@/lib/stock';
import { sendOrderShippedEmail } from '@/lib/email';

const CheckoutSchema = z.object({
  nombre: z.string().min(2),
  email: z.email(),
  telefono: z.string().optional(),
  direccion: z.string().min(5),
  ciudad: z.string().min(2),
  cp: z.string().min(4),
  notas: z.string().optional(),
  tipo_cliente: z.enum(['particular', 'empresa']).default('particular'),
  facturacion_empresa: z.string().optional(),
  facturacion_nif: z.string().optional(),
  facturacion_dir: z.string().optional(),
  facturacion_ciudad: z.string().optional(),
  facturacion_cp: z.string().optional(),
  cart_json: z.string().min(2),
}).refine(
  (d) => d.tipo_cliente !== 'empresa' || (!!d.facturacion_nif?.trim() && !!d.facturacion_empresa?.trim()),
  { message: 'Para empresa, el CIF/NIF y la razón social son obligatorios', path: ['facturacion_nif'] },
);

export async function createOrder(formData: FormData) {
  const parsed = CheckoutSchema.safeParse({
    nombre:               formData.get('nombre'),
    email:                formData.get('email'),
    telefono:             formData.get('telefono') || undefined,
    direccion:            formData.get('direccion'),
    ciudad:               formData.get('ciudad'),
    cp:                   formData.get('cp'),
    notas:                formData.get('notas') || undefined,
    tipo_cliente:         formData.get('tipo_cliente') || 'particular',
    facturacion_empresa:  formData.get('facturacion_empresa') || undefined,
    facturacion_nif:      formData.get('facturacion_nif') || undefined,
    facturacion_dir:      formData.get('facturacion_dir') || undefined,
    facturacion_ciudad:   formData.get('facturacion_ciudad') || undefined,
    facturacion_cp:       formData.get('facturacion_cp') || undefined,
    cart_json:            formData.get('cart_json'),
  });

  if (!parsed.success) {
    return { error: 'Por favor revisa los datos del formulario' };
  }

  const {
    nombre, email, telefono, direccion, ciudad, cp, notas,
    tipo_cliente, facturacion_empresa, facturacion_nif,
    facturacion_dir, facturacion_ciudad, facturacion_cp,
    cart_json,
  } = parsed.data;

  let rawItems: CartItem[];
  try {
    rawItems = JSON.parse(cart_json);
    if (!Array.isArray(rawItems) || rawItems.length === 0) throw new Error('empty');
  } catch {
    return { error: 'El carrito está vacío' };
  }

  // Revalidar cada línea contra la DB: NUNCA confiar en el precio que envía el
  // navegador. El precio sale de product_variants (por formato) o de precio_desde.
  type ValidItem = {
    slug: string; familia: string; formato: string;
    cantidad: number; precio: number; nombre: string; productId: number;
  };
  const items: ValidItem[] = [];
  for (const it of rawItems) {
    const cantidad = Math.max(1, Math.floor(Number(it.cantidad) || 1));
    const [product] = await sql`
      SELECT id, nombre, familia, precio_desde
      FROM products WHERE slug = ${it.slug} AND publicado = true LIMIT 1
    `;
    if (!product) continue; // ignora slugs inexistentes o despublicados
    const [variant] = await sql`
      SELECT precio FROM product_variants
      WHERE product_id = ${product.id} AND formato = ${it.formato} LIMIT 1
    `;
    const precio = variant ? Number(variant.precio) : Number(product.precio_desde ?? 0);
    if (!(precio > 0)) continue; // sin precio válido → no se puede comprar
    items.push({
      slug: String(it.slug),
      familia: String(it.familia ?? product.familia),
      formato: String(it.formato ?? ''),
      cantidad,
      precio,
      nombre: String(product.nombre ?? product.familia),
      productId: Number(product.id),
    });
  }
  if (items.length === 0) {
    return { error: 'No hemos podido validar los productos del carrito. Inténtalo de nuevo.' };
  }

  // Total con precios ya validados de la DB. El descuento depende de la promo
  // ACTIVA (3×2 / % / ninguno) — nunca se confía en lo que envía el navegador.
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const { promo } = await getSettings();
  // promoDiscount solo usa slug/precio/cantidad; los ValidItem ya los tienen.
  const discount = promoDiscount(items as unknown as CartItem[], promo);
  const orderTotal = Number((subtotal - discount).toFixed(2));

  // Generate order number: YYYYMMDD-XXXX
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  const numeroPedido = `${datePart}-${randPart}`;

  const [order] = await sql`
    INSERT INTO orders (
      numero_pedido, cliente_nombre, cliente_email, cliente_telefono,
      cliente_direccion, cliente_ciudad, cliente_cp, total, notas,
      tipo_cliente, facturacion_empresa, facturacion_nif,
      facturacion_dir, facturacion_ciudad, facturacion_cp
    )
    VALUES (
      ${numeroPedido}, ${nombre}, ${email}, ${telefono ?? null},
      ${direccion}, ${ciudad}, ${cp}, ${orderTotal}, ${notas ?? null},
      ${tipo_cliente}, ${facturacion_empresa ?? null}, ${facturacion_nif ?? null},
      ${facturacion_dir ?? null}, ${facturacion_ciudad ?? null}, ${facturacion_cp ?? null}
    )
    RETURNING id, numero_pedido
  `;

  // Insert order items con precio y nombre reales (validados desde la DB)
  for (const item of items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, nombre_producto, formato)
      VALUES (${order.id}, ${item.productId}, ${item.cantidad}, ${item.precio},
              ${item.nombre}, ${item.formato})
    `;
  }

  redirect(`/pedido-confirmado?pedido=${order.numero_pedido}`);
}

/**
 * Crea una Stripe Checkout Session a partir del formulario. NO crea el pedido
 * todavía: guarda los datos validados en `pending_checkouts` y el pedido real se
 * crea solo cuando el pago se confirma (página de confirmación + webhook).
 */
export async function createCheckoutSession(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  if (!stripeConfigured()) {
    return { error: 'El pago todavía no está configurado. Inténtalo más tarde.' };
  }

  const parsed = CheckoutSchema.safeParse({
    nombre:               formData.get('nombre'),
    email:                formData.get('email'),
    telefono:             formData.get('telefono') || undefined,
    direccion:            formData.get('direccion'),
    ciudad:               formData.get('ciudad'),
    cp:                   formData.get('cp'),
    notas:                formData.get('notas') || undefined,
    tipo_cliente:         formData.get('tipo_cliente') || 'particular',
    facturacion_empresa:  formData.get('facturacion_empresa') || undefined,
    facturacion_nif:      formData.get('facturacion_nif') || undefined,
    facturacion_dir:      formData.get('facturacion_dir') || undefined,
    facturacion_ciudad:   formData.get('facturacion_ciudad') || undefined,
    facturacion_cp:       formData.get('facturacion_cp') || undefined,
    cart_json:            formData.get('cart_json'),
  });
  if (!parsed.success) return { error: 'Por favor revisa los datos del formulario' };
  const d = parsed.data;

  let rawItems: CartItem[];
  try {
    rawItems = JSON.parse(d.cart_json);
    if (!Array.isArray(rawItems) || rawItems.length === 0) throw new Error('empty');
  } catch {
    return { error: 'El carrito está vacío' };
  }

  const priced = await priceCart(rawItems);
  if (!priced) {
    return { error: 'No hemos podido validar los productos del carrito. Inténtalo de nuevo.' };
  }
  const { items, discount, total } = priced;

  // Anti-sobreventa: no se llega a Stripe si alguna línea supera el stock real.
  const sinStock = items.find((i) => i.stock !== null && i.cantidad > i.stock);
  if (sinStock) {
    return {
      error: sinStock.stock && sinStock.stock > 0
        ? `No queda stock suficiente de ${sinStock.familia} (${sinStock.formato}): quedan ${sinStock.stock} unidades.`
        : `${sinStock.familia} (${sinStock.formato}) está agotado ahora mismo. Quítalo de la cesta para continuar.`,
    };
  }

  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const numeroPedido = `${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    numeroPedido, total,
    nombre: d.nombre, email: d.email, telefono: d.telefono ?? null,
    direccion: d.direccion, ciudad: d.ciudad, cp: d.cp, notas: d.notas ?? null,
    tipo_cliente: d.tipo_cliente,
    facturacion_empresa: d.facturacion_empresa ?? null,
    facturacion_nif: d.facturacion_nif ?? null,
    facturacion_dir: d.facturacion_dir ?? null,
    facturacion_ciudad: d.facturacion_ciudad ?? null,
    facturacion_cp: d.facturacion_cp ?? null,
    // La factura se SOLICITA aquí, pero NO se emite hasta que el pedido esté
    // 'completado' (entregado y aceptado). Empresa siempre la necesita.
    factura_solicitada: d.tipo_cliente === 'empresa' || formData.get('quiere_factura') === 'on',
    items: items.map((i) => ({
      productId: i.productId, cantidad: i.cantidad, precio: i.precio, nombre: i.nombre, formato: i.formato,
    })),
  };
  await sql`INSERT INTO pending_checkouts (id, payload) VALUES (${numeroPedido}, ${JSON.stringify(payload)}::jsonb)`;

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  try {
    let couponId: string | undefined;
    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: 'eur',
        duration: 'once',
        name: 'Promo 3×2',
      });
      couponId = coupon.id;
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      customer_email: d.email,
      line_items: items.map((i): Stripe.Checkout.SessionCreateParams.LineItem => ({
        quantity: i.cantidad,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(i.precio * 100),
          product_data: { name: `${i.familia}${i.formato ? ' · ' + i.formato : ''}` },
        },
      })),
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      success_url: `${base}/pedido-confirmado?pedido=${numeroPedido}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/carrito`,
      metadata: { pending_id: numeroPedido },
    });
    await sql`UPDATE pending_checkouts SET session_id = ${session.id} WHERE id = ${numeroPedido}`;
    if (!session.url) return { error: 'No se pudo iniciar el pago.' };
    return { url: session.url };
  } catch {
    return { error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' };
  }
}

// Ciclo de vida del pedido. 'nuevo' = pagado, pendiente de preparar.
// Flujo: nuevo → confirmado → enviado → entregado → completado.
// 'completado' = entregado Y aceptado por el cliente → único estado en el que
// se puede emitir la factura (ver lib/invoicing.ts). 'cancelado'/'reembolsado'
// para pedidos anulados o devueltos.
const VALID_ESTADOS = ['nuevo', 'confirmado', 'enviado', 'entregado', 'completado', 'cancelado', 'reembolsado'] as const;

async function applyStatusChange(orderId: number, estado: string) {
  await sql`UPDATE orders SET estado = ${estado} WHERE id = ${orderId}`;
  // Sellos de tiempo del ciclo de vida (para el panel de pedidos).
  if (estado === 'enviado') {
    const [row] = await sql`
      UPDATE orders SET enviado_at = COALESCE(enviado_at, now()) WHERE id = ${orderId}
      RETURNING numero_pedido, cliente_nombre, cliente_email, tracking_url
    `;
    // Aviso "tu pedido va de camino" (+ tracking si GENEI lo ha rellenado).
    if (row) {
      await sendOrderShippedEmail({
        numero: String(row.numero_pedido),
        nombre: String(row.cliente_nombre),
        email: String(row.cliente_email),
        trackingUrl: row.tracking_url ? String(row.tracking_url) : null,
      }).catch(() => {});
    }
  }
  if (estado === 'entregado') {
    await sql`UPDATE orders SET entregado_at = COALESCE(entregado_at, now()) WHERE id = ${orderId}`;
  }
  // Pedido anulado o devuelto → el género vuelve al almacén (idempotente).
  if (estado === 'cancelado' || estado === 'reembolsado') {
    await restoreStockForOrder(orderId).catch(() => {});
  }
  // Al COMPLETAR (entregado y aceptado), si el cliente pidió factura se intenta
  // emitir automáticamente. Hoy queda 'pendiente' hasta integrar Verifactu;
  // cuando se enchufe el proveedor, se emitirá sola aquí.
  if (estado === 'completado') {
    await issueInvoiceForOrder(orderId).catch(() => {});
  }
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin');
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function updateOrderStatus(orderId: number, formData: FormData) {
  const estado = formData.get('estado') as string;
  if (!VALID_ESTADOS.includes(estado as typeof VALID_ESTADOS[number])) {
    return { error: 'Estado inválido' };
  }
  await applyStatusChange(orderId, estado);
  redirect(`/admin/pedidos/${orderId}`);
}

/** Cambio de estado en línea (desde el listado). No redirige. */
export async function changeOrderStatus(orderId: number, estado: string) {
  if (!VALID_ESTADOS.includes(estado as typeof VALID_ESTADOS[number])) {
    return { error: 'Estado inválido' };
  }
  await applyStatusChange(orderId, estado);
  return { ok: true };
}

/**
 * Guarda el enlace de seguimiento del envío (manual hasta integrar GENEI).
 * Se incluye en el email "tu pedido va de camino" al pasar a 'enviado',
 * así que conviene rellenarlo ANTES de cambiar el estado.
 */
export async function updateOrderTracking(orderId: number, formData: FormData) {
  const raw = String(formData.get('tracking_url') ?? '').trim();
  if (raw && !/^https?:\/\//i.test(raw)) {
    return { error: 'El enlace de seguimiento debe empezar por http:// o https://' };
  }
  await sql`UPDATE orders SET tracking_url = ${raw || null}, updated_at = now() WHERE id = ${orderId}`;
  revalidatePath(`/admin/pedidos/${orderId}`);
  redirect(`/admin/pedidos/${orderId}`);
}

/** Emite la factura de un pedido (botón del admin). Respeta el gating. */
export async function issueInvoice(orderId: number) {
  const r = await issueInvoiceForOrder(orderId);
  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${orderId}`);
  return r;
}
