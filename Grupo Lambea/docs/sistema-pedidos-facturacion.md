# Sistema de pedidos y facturación

Análisis y diseño del ciclo de vida del pedido, las acciones del cliente y la
facturación (preparado para Verifactu). Foundation ya implementada; ver al final
qué falta.

## 1. Principio clave: pago ≠ facturación

El pago y la factura están **separados**. La factura **NO se emite al pagar**.
Se emite solo cuando el pedido está **entregado y aceptado** por el cliente. Así
se evita facturar pedidos que se cancelan, no se envían o se devuelven (y el
problema fiscal de justificar a Hacienda una factura de algo que no se entregó).

## 2. Ciclo de vida del pedido (`orders.estado`)

| Estado | Significado | `enviado_at`/`entregado_at` | ¿Facturable? |
|---|---|---|---|
| `nuevo` | Pagado (Stripe), pendiente de preparar | — | No |
| `confirmado` | La empresa confirma que lo va a enviar | — | No |
| `enviado` | Enviado (etiqueta GENEI) | sella `enviado_at` | No |
| `entregado` | Entregado al cliente | sella `entregado_at` | No |
| `completado` | Entregado **y aceptado** (o pasado el plazo de devolución) | — | **Sí** |
| `cancelado` | Anulado antes de enviar → reembolso | — | No |
| `reembolsado` | Devuelto tras recibir → reembolso (+ factura rectificativa si ya se emitió) | — | No |

**Flujo normal:** `nuevo → confirmado → enviado → entregado → completado`.

El pedido **solo se crea tras el pago** (Stripe). Antes de pagar, los datos viven
en `pending_checkouts`; ver `lib/checkout.ts`.

## 3. Facturación (gating)

Campos en `orders`:
- `factura_solicitada` (boolean): empresa **siempre**; particular si marca el check en el checkout.
- `factura_estado`: `no` | `pendiente` | `emitida` | `error`.
- `factura_numero`, `factura_url`, `factura_emitida_at`.

**Regla** (`canIssueInvoice` en `lib/invoicing.ts`): la factura solo se puede emitir si
`factura_solicitada = true` **y** `estado = 'completado'`.

Cuando un pedido pasa a `completado` (en `applyStatusChange`, `app/actions/orders.ts`),
si la factura estaba solicitada se **intenta emitir automáticamente**. Hoy, como
Verifactu no está integrado, queda en `pendiente` (el gestor la emite a mano);
cuando se enchufe el proveedor, se emitirá sola en ese mismo punto.

## 4. Verifactu (scaffold listo para enchufar)

Todo en `lib/invoicing.ts`:
- `InvoiceProvider` (interfaz): `issue(order) → { numero, url }`.
- `PendingProvider`: placeholder actual (lanza "Verifactu no configurado").
- `getInvoiceProvider()`: **aquí** se devolverá el proveedor real según
  `process.env.INVOICING_PROVIDER`.

**Para integrar Verifactu** (cuando se elija herramienta — Quaderno, fiskaly,
Verifacti, B2Brouter, o la del Kit Digital con API):
1. Implementar una clase `XxxProvider implements InvoiceProvider` cuyo `issue()`
   llame a la API del proveedor (encadenado + QR + envío a la AEAT) y devuelva el
   número legal de factura y el PDF.
2. Devolverla en `getInvoiceProvider()` según `INVOICING_PROVIDER`.
3. Añadir sus claves a `.env` (nunca hardcodear).

No hay que tocar nada más: `issueInvoiceForOrder()` ya hace el gating, llama al
proveedor y actualiza `factura_*`. Es idempotente.

## 5. Acciones del cliente y cómo se manejan

| Acción | Manejo | Estado |
|---|---|---|
| Hacer pedido + pagar | Stripe Checkout → webhook/confirmación crea el pedido | ✅ hecho |
| Cancelar antes de enviar | Admin pone `cancelado` + reembolso Stripe | ⏳ falta botón de reembolso |
| Pedir factura | `factura_solicitada`; se emite al `completar` | ✅ gating hecho · ⏳ provider Verifactu |
| Devolución tras recibir | Admin `reembolsado` + (si facturado) factura rectificativa | ⏳ |
| Seguimiento del envío | GENEI tracking | ⏳ |
| Contacto / soporte | Formulario de contacto (Resend) | ⏳ Resend |

## 6. Panel de admin de pedidos

- **Pestañas por estado** (ya añadidas en `PedidosListClient.tsx` + `ORDER_STATUS`
  en `app/admin/_components/layout.tsx`): nuevo / confirmado / enviado / entregado
  / completado / cancelado / reembolsado.
- **Server actions** listas (`app/actions/orders.ts`): `changeOrderStatus`,
  `updateOrderStatus` (sellan timestamps + auto-factura al completar), `issueInvoice`.
- **Pendiente en la UI del admin** (siguiente paso): mostrar la columna
  `factura_estado` + un botón **"Emitir factura"** (llama a `issueInvoice`,
  habilitado solo si el pedido es facturable), y un botón de **reembolso** Stripe.

## 7. Estado: hecho vs pendiente

**Hecho (foundation):** estados del ciclo de vida + timestamps; gating de factura;
captura de `factura_solicitada` en el checkout; auto-intento de emisión al
completar; scaffold `InvoiceProvider` para Verifactu; columnas DB + `pending_checkouts`.

**Pendiente:**
- Proveedor Verifactu real (cuando se elija la herramienta / API).
- UI del admin: columna de factura + botón "Emitir factura" + botón de reembolso.
- Reembolsos en Stripe (cancelaciones/devoluciones).
- GENEI (envío + tracking) y emails (Resend).
