# Pendientes (vivos) — Grupo Lambea

> Documento vivo. Vamos tachando. Última actualización: **14/06/2026**.
>
> Snapshot anterior (06/06): `docs/pendientes.md`. Reunión con cliente: `docs/puesta-en-marcha.md`. Diseño del sistema: `docs/sistema-pedidos-facturacion.md`.

---

## 0. Decisión del cliente (14/06/2026)

El cliente **NO quiere Verifactu de momento**. Sigue emitiendo las facturas él, a mano, con su programa **FactuCont** (programa local de facturación para pymes/autónomos en España; no tiene API pública útil para integrar 1:1 con la web). Por tanto, **toda la facturación queda manual** y el panel tiene que **ponérselo lo más fácil posible** para que pueda crear cada factura en FactuCont en 30 segundos.

Esto cambia el plan: no integramos `InvoiceProvider` Verifactu (queda dormido el scaffold por si en el futuro lo enciende). En su lugar, hacemos lo del bloque **B** de abajo.

---

## A. Bloqueantes para vender de verdad (necesitan al cliente)

- [ ] **A1. Stripe LIVE** — cuenta del cliente a nombre de **SOLUCIONES ECOLAM S.L (CIF B55380679)**, KYC + IBAN. Me entrega acceso *Developer* o las claves `sk_…` y `pk_…` (live + test). Reactivar cuenta si está parada.
- [ ] **A2. Webhook Stripe en producción** — lo creo yo en su panel cuando tenga acceso, me genera `whsec_…`. Sin esto los reembolsos y la confirmación de pago no disparan en prod.
- [ ] **A3. Resend** — cuenta + verificar dominio `grupolambea.com` (SPF, DKIM, DMARC) → activa los emails de pedido y el formulario de contacto.
- [ ] **A4. DNS grupolambea.com** — acceso al panel DNS o disposición a meter los registros que yo le pase. Sin esto no hay go-live ni Resend verificable.
- [ ] **A5. Go-live** — apuntar grupolambea.com a Vercel + variables de entorno en `production` (Vercel CLI: `vercel env add`).
- [ ] **A6. GENEI** — cuenta del cliente + me entrega API key + dirección de origen + **pesos reales por formato** (no existen aún en DB). Detalle en bloque C2.

---

## B. Facturación manual asistida (FactuCont) — sustituye al plan Verifactu

> Objetivo: que el cliente, mirando un pedido en el admin, pueda **copiar los datos a FactuCont en menos de un minuto** y luego **marcar la factura como emitida** con el nº correlativo que le ha asignado FactuCont.

### B1. Cambios en el panel de admin de pedidos
- [ ] **Ficha fiscal imprimible / PDF por pedido** — botón "Imprimir ficha" en `/admin/pedidos/[id]` que abra una vista A4 con TODO lo que el cliente necesita teclear en FactuCont:
  - Nº pedido + fecha del pedido + fecha de entrega (`entregado_at`)
  - Datos fiscales del comprador (Empresa/Particular, Razón social o nombre, NIF/CIF, dirección fiscal completa, CP, ciudad, país)
  - Líneas: descripción, cantidad, **precio unitario sin IVA**, IVA (21 % siempre hoy), subtotal por línea
  - **Base imponible / IVA / Total** desglosados (la web hoy guarda precios con IVA incluido — hay que sacar la base con `total / 1,21`)
  - Forma de pago: "Stripe — Charge ID `ch_…`" + cuenta de cobro
  - Notas del cliente si las hay
- [ ] **Botón "Marcar como facturada"** — abre un mini-form con:
  - `nº factura` (el correlativo de FactuCont, libre)
  - `fecha emisión`
  - (opcional) **subir PDF de la factura** (se guarda en Vercel Blob, queda enlazado en `orders.factura_url`)
  - Server action que actualiza `factura_estado='emitida'`, `factura_numero`, `factura_emitida_at`, `factura_url`.
- [ ] **Email automático al cliente con la factura adjunta** — cuando se sube el PDF, manda un email "Aquí tienes tu factura" con el PDF adjunto (requiere Resend, bloque A3).
- [ ] **Columna `factura_estado` en la tabla de pedidos** + filtro "pendientes de facturar" → lista directa de los `completados` con `factura_solicitada=true` y `factura_estado!='emitida'`.

### B2. Cambios en `lib/invoicing.ts`
- [ ] Mantener el **gating** intacto (factura solo si `estado='completado'` + `factura_solicitada=true`). No tocar.
- [ ] Cambiar el mensaje de `PendingProvider` para que **NO** diga "Verifactu no configurado" sino algo neutro tipo *"emisión manual: pendiente de generar en FactuCont"*.
- [ ] Quitar de la auto-emisión al pasar a `completado` el intento de provider y dejarla en `pendiente` directamente — sin error en la UI.
- [ ] Conservar el scaffold `InvoiceProvider` para futuro Verifactu, pero **comentar** el `TODO` para que no llame la atención del cliente.

### B3. Export de facturación (opcional, segunda iteración)
- [ ] **Botón "Exportar pedidos pendientes de facturar a CSV"** — formato plano (1 fila por línea de pedido) que el cliente pueda abrir en Excel y, si quiere, importar a FactuCont si su versión soporta importación CSV. Si no lo usa, lo deja.

### B4. UX y copy
- [ ] Donde antes ponía "Verifactu" en la UI → poner **"Facturación"** o **"FactuCont (manual)"**.
- [ ] Tooltip en el botón "Emitir factura" → *"Crea la factura en FactuCont y luego pega aquí el nº correlativo."*

---

## C. Correos / mensajes a redactar (yo, no el cliente)

- [ ] **C1. Email a GENEI** — pedirles:
  - Alta cuenta del cliente (SOLUCIONES ECOLAM S.L (CIF B55380679), CIF B-…) — *o que el cliente confirme que ya la tiene abierta*
  - **API key + documentación** (endpoints crear envío, etiqueta PDF, tracking, cancelación)
  - Tarifas para 0–1 kg, 1–3 kg, 3–5 kg, 5–10 kg (peninsular + Baleares + Canarias)
  - Mensajerías que pueden usar
  - Si soportan recogida en domicilio del remitente (Tarragona)
- [ ] **C2. Email/llamada al cliente** — checklist único:
  - Acceso *Developer* a su Stripe (o sus `sk_/pk_` test + live)
  - Acceso al **panel DNS** de grupolambea.com (o disposición a meter registros)
  - **Pesos reales** por formato de cada producto activo (tabla con SKU + formato + gramos). Sin esto GENEI no genera etiqueta.
  - Correos de destino: ¿a qué email llegan los pedidos? ¿a qué email llega el formulario de contacto?
  - Confirmar **decisión FactuCont** (que ha cambiado): ¿va a aceptar la "ficha fiscal imprimible + marcar como facturada"? ¿prefiere también el CSV de export?
  - ¿Quiere también que la web le mande **un email automático** con la ficha del pedido (en PDF) cuando entra cada pedido nuevo, para no tener que entrar al panel?
- [ ] **C3. Email/llamada al cliente — Resend** — confirmar si tendrá él la cuenta o la agencia, y si las **campañas** de marketing las manda él o yo.

---

## D. Configuraciones técnicas (yo, en cuanto tenga las credenciales)

- [ ] **D1. Stripe** — variables en Vercel (`STRIPE_SECRET_KEY` live, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` live, `STRIPE_WEBHOOK_SECRET`). Crear webhook en `dashboard.stripe.com` apuntando a `/api/stripe/webhook`. Probar con una compra real de 1 € + reembolso.
- [ ] **D2. Resend** — crear cuenta, verificar dominio, plantillas (`order_confirmation`, `order_shipped`, `order_invoice`, `contact`). Variables `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
- [ ] **D3. DNS grupolambea.com** — A/CNAME a Vercel + MX (si manejamos email) + SPF/DKIM/DMARC para Resend + CAA si aplica.
- [ ] **D4. Vercel** — entornos `production` vs `preview`. Cargar todas las env vars. Decidir titularidad del proyecto (agencia o cliente).
- [ ] **D5. Base de datos (Neon)** — añadir columna `peso_gramos` en `product_variants` cuando lleguen los pesos del cliente. Backfill.

---

## E. Mejoras que se pueden lanzar después (no bloquean)

- [ ] **E1. Botón de reembolso desde el admin** — UI sobre la server action `refundOrder` ya existente (Stripe `refunds.create`).
- [ ] **E2. `loading.tsx` / `error.tsx`** para evitar pantallazos en blanco al navegar.
- [ ] **E3. Logo de Aris Multimedia** en el footer (esperando archivo).
- [ ] **E4. Botón flotante de WhatsApp** (ya hay número de toxicología 915 620 420; aquí es para soporte comercial).
- [ ] **E5. CTA sticky de compra** en móvil en `/tienda/[slug]`.
- [ ] **E6. Coordenadas reales del mapa** de contacto.
- [ ] **E7. Stripe Customer Emails** activado (Settings → Customer emails) como apaño hasta tener Resend.
- [ ] **E8. Cupones únicos** en emails de confirmación (Stripe Promotion Codes).
- [ ] **E9. Cálculo del coste de envío por CP** en el checkout, vía GENEI (Fase 2).
- [ ] **E10. Migrar imágenes** del WordPress viejo a Vercel Blob (hoy `next.config.ts` apunta a `grupolambea.com`).

---

## F. Log de cambios del documento

- **2026-06-14** — Decisión: el cliente sigue con FactuCont (manual). Se reorienta el bloque de facturación → manual asistida (B). Verifactu queda dormido. Snapshot anterior `pendientes.md` se preserva como histórico.
