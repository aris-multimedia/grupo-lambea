'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sql } from '@/lib/db';
import type { CartItem } from '@/types/product';

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
});

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

  let items: CartItem[];
  try {
    items = JSON.parse(cart_json);
    if (!Array.isArray(items) || items.length === 0) throw new Error('empty');
  } catch {
    return { error: 'El carrito está vacío' };
  }

  // Calculate total (mirrors lib/cart.ts logic)
  function subtotal(its: CartItem[]) {
    return its.reduce((s, i) => s + i.precio * i.cantidad, 0);
  }
  function freeUnits(its: CartItem[], slug: string) {
    const units = its.filter(i => i.slug === slug).reduce((s, i) => s + i.cantidad, 0);
    return Math.floor(units / 3);
  }
  function discount(its: CartItem[]) {
    const slugs = [...new Set(its.map(i => i.slug))];
    return slugs.reduce((total, slug) => {
      const free = freeUnits(its, slug);
      if (free === 0) return total;
      const units: number[] = [];
      for (const item of its.filter(i => i.slug === slug)) {
        for (let j = 0; j < item.cantidad; j++) units.push(item.precio);
      }
      units.sort((a, b) => a - b);
      return total + units.slice(0, free).reduce((s, p) => s + p, 0);
    }, 0);
  }
  const orderTotal = Number((subtotal(items) - discount(items)).toFixed(2));

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

  // Insert order items
  for (const item of items) {
    const [product] = await sql`SELECT id FROM products WHERE slug = ${item.slug} LIMIT 1`;
    await sql`
      INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, nombre_producto, formato)
      VALUES (${order.id}, ${product?.id ?? null}, ${item.cantidad}, ${item.precio},
              ${item.familia}, ${item.formato})
    `;
  }

  redirect(`/pedido-confirmado?pedido=${order.numero_pedido}`);
}

const VALID_ESTADOS = ['nuevo', 'confirmado', 'enviado', 'cancelado'] as const;

export async function updateOrderStatus(orderId: number, formData: FormData) {
  const estado = formData.get('estado') as string;
  if (!VALID_ESTADOS.includes(estado as typeof VALID_ESTADOS[number])) {
    return { error: 'Estado inválido' };
  }
  await sql`UPDATE orders SET estado = ${estado} WHERE id = ${orderId}`;
  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${orderId}`);
  redirect(`/admin/pedidos/${orderId}`);
}
