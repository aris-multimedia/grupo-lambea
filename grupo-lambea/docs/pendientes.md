# Pendientes — Grupo Lambea (estado a 06/06/2026)

Lista única de lo que falta para dejar la tienda lista. Para retomar el lunes.

## ✅ Hecho y probado
- Web completa (diseño, catálogo, fichas, SEO, datos fiscales = SOLUCIONES ECOLAM S.L · B55380679).
- **Pago con Stripe (modo test)** end-to-end: checkout → pasarela → pago → pedido creado (solo al pagar) + cesta vaciada. Promo 3×2 = cupón.
- Ciclo de vida del pedido + estados en el admin (nuevo→confirmado→enviado→entregado→completado, + cancelado/reembolsado).
- Facturación con gating preparada para Verifactu (factura solo al `completado`). Scaffold en `lib/invoicing.ts`.
- Newsletter (capta suscriptores con consentimiento).

## 🔌 Construido HOY pero necesita CONFIGURACIÓN para funcionar de verdad
1. **Email de confirmación de pedido** — cableado (`lib/email.ts`, se llama al crear el pedido). **No envía** hasta configurar **Resend** (`RESEND_API_KEY` + `CONTACT_FROM_EMAIL` con dominio verificado). En cuanto se enchufe, sale solo.
2. **Reembolso/cancelación desde Stripe → reflejado en la web** — el webhook ya maneja `charge.refunded` → marca el pedido `reembolsado` (se guarda el `payment_intent` para enlazarlo). **Necesita el webhook configurado en Stripe** (`STRIPE_WEBHOOK_SECRET`) para que dispare en producción.

## 🔴 Bloqueante para vender de verdad (necesita cuentas/claves del cliente)
3. **Stripe LIVE** — pasar de claves test a live + reactivar la cuenta del cliente para cobros reales.
4. **Resend** — cuenta + dominio verificado (DNS de grupolambea.com) → activa el email del punto 1 y el formulario de contacto.
5. **Webhook de Stripe en producción** → activa el punto 2 (reembolsos) y es el respaldo de la confirmación de pago.
6. **Go-live**: apuntar grupolambea.com a la web nueva (DNS) + variables de entorno en Vercel.

## 🟡 Importante (se puede lanzar y mejorar después)
7. **GENEI (envíos)** — cuenta + API del cliente + **añadir campo de peso por producto** (no existe) + el cliente da los pesos. Generar etiqueta + tracking tras el pago.
8. **UI del admin para gestión de pedidos** — la lógica ya está (server actions), falta la UI:
   - Columna **estado de factura** + botón **"Emitir factura"** (server action `issueInvoice`, solo si facturable).
   - Botón de **reembolso** desde el admin (llamar a Stripe `refunds.create`).
   - Mover el pedido por estados (ya hay pestañas) + ver timeline (enviado_at/entregado_at).
9. **Verifactu** — implementar un `InvoiceProvider` real cuando se elija la herramienta (Quaderno/fiskaly/Verifacti/B2Brouter…). Hoy queda `pendiente`. ⚠️ aikit.es es de IA, NO de facturación.
10. **Facturación**: confirmar con el cliente programa/gestoría + si quedan fondos Kit Digital en "Factura Electrónica".
11. **Email marketing** (campañas) — elegir herramienta (Resend/Brevo) y conectar el newsletter.

## 🟢 Mejoras (no bloquean)
12. `loading.tsx`/`error.tsx` (quitar parpadeo en blanco al navegar).
13. **Logo de Aris Multimedia** en el footer (pendiente que Adrià me pase el archivo).
14. Botón flotante de **WhatsApp**, CTA de compra sticky en móvil, filtros en categorías.
15. Coordenadas reales del mapa de contacto.
16. Recibos automáticos de Stripe (Settings → Customer emails) como apaño hasta tener Resend.

## Regla crítica (recordatorio)
La **factura NUNCA se emite al pagar**, solo cuando el pedido está `completado` (entregado y aceptado). Ver `docs/sistema-pedidos-facturacion.md`.
