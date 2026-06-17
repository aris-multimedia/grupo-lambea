# Pasos operativos para activar cada servicio

> Playbook: para cada servicio, qué hace, qué hay que pedir, **quién** lo hace, y **dónde** va la información.
>
> Donde dices "**tú**" = Adrià (Aris Multimedia). "**Cliente**" = Grupo Lambea / SOLUCIONES ECOLAM S.L (CIF B55380679). "**Yo**" = Claude.
>
> Todo lo que diga "guardar aquí" se pega en `secretos-cliente.local.docx`.

---

## 1. GENEI (envíos)

**Qué es:** Plataforma agregadora de logística (no entregan ellos; orquestan Correos Express, GLS, Seur, etc.). Necesitamos su API para crear envíos tras cada pedido y obtener el código de seguimiento.

**Pasos:**

1. **Cliente** se da de alta en https://genei.es como empresa **SOLUCIONES ECOLAM S.L (CIF B55380679)** (o me confirma si ya tiene cuenta).
2. **Tú** mandas el email del bloque 1.1 al contacto técnico/comercial de GENEI. Píde:
   - Activación de API en su cuenta
   - **API key/token** + documentación
   - URL base del endpoint
   - Tarifas confirmadas por tramos de peso + recargos Baleares/Canarias
   - Confirmación de recogida en domicilio (Tarragona)
3. **GENEI** te devuelve:
   - API key en su panel de cliente (sección "Integraciones" / "API")
   - PDF/URL de documentación
4. **Tú** pegas en `secretos-cliente.local.docx` **sección 2**:
   - API key
   - URL base
   - Tarifas
   - Mensajerías habilitadas
5. **Yo** implemento `lib/genei.ts`: crear envío, obtener etiqueta PDF, tracking, cancelar. Engancho con `app/actions/orders.ts` al pasar el pedido a "enviado".
6. **Probamos** un envío de prueba con tu cuenta antes de live real.

**Bloqueante adicional:** los **pesos por formato** (los pesa el cliente y los rellena en `secretos-cliente.local.docx` sección 6). Sin esto no puedo generar etiquetas reales.

### 1.1 Email a GENEI (te lo redacto cuando me lo pidas)

Cuando me digas, te genero un borrador limpio. Lo dejas en borradores de Gmail y lo mandas tú.

---

## 2. Stripe (cobros)

**Qué es:** Pasarela de pago. Ya está cableada en modo TEST. Falta activar LIVE.

**Pasos:**

1. **Cliente** completa el KYC en Stripe a nombre de **SOLUCIONES ECOLAM S.L (CIF B55380679)**, mete IBAN, activa pagos.
2. **Cliente** te invita como *Developer* en Stripe: `Settings → Team and security → Add user → role: Developer` con tu email.
3. **Tú** aceptas la invitación que llega por email.
4. **Tú** entras en `dashboard.stripe.com` (modo LIVE), vas a `Developers → API keys` y pegas en `secretos-cliente.local.docx` **sección 1**:
   - `pk_live_…` (publishable)
   - `sk_live_…` (secret)
5. **Yo** creo el webhook en producción:
   - URL: `https://grupolambea.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `charge.refunded`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Stripe te da un `whsec_…` → lo pegas en sección 1.
6. **Yo** cargo las 3 variables en Vercel `production` (`vercel env add`).
7. **Probamos** una compra real de 1 € + reembolso para validar el flujo end-to-end.

**Cosas que NO hace Stripe en este proyecto:**
- **No** emite la factura (la emite el cliente con FactuCont).
- **No** manda el email de confirmación con marca propia (eso lo hace Resend — paso 3). Sí puede mandar el "recibo" estándar de Stripe si activas *Customer emails* (Settings → Customer emails) como apaño.

---

## 3. Resend (emails transaccionales)

**Qué es:** Servicio de envío de email desde tu dominio. Necesario para:
- Email de "pedido recibido" con marca Grupo Lambea
- Email de "pedido enviado" con tracking
- Email de "tu factura" con PDF adjunto (cuando esté el flujo FactuCont)
- Acuse del formulario de contacto

**Pasos:**

1. **Tú o el cliente** crea cuenta en https://resend.com.
2. En Resend → `Domains → Add Domain` → `grupolambea.com`.
3. Resend te devuelve **3 registros DNS** para añadir al panel del dominio:
   - **TXT** (SPF) en `@` — tipo `v=spf1 include:resend.com ~all`
   - **TXT** (DKIM) en `resend._domainkey` — el valor concreto te lo da Resend
   - **TXT** (DMARC) en `_dmarc` — tipo `v=DMARC1; p=none; rua=mailto:dmarc@grupolambea.com`
4. **Tú** los pegas en `secretos-cliente.local.docx` **sección 3** y los metes en el panel DNS (paso 4).
5. Esperar ~15 min, dar a **Verify** en Resend. Quedará verde.
6. **Tú** generas API key en `Resend → API Keys → Create` y la pegas en sección 3.
7. **Tú** decides:
   - `CONTACT_FROM_EMAIL`: de quién salen los emails (ej. `Grupo Lambea <web@grupolambea.com>` o `pedidos@grupolambea.com`)
   - `CONTACT_TO_EMAIL`: a qué buzón del cliente llegan los formularios de contacto
8. **Yo** cargo en Vercel y mando un email de prueba.

---

## 4. DNS de grupolambea.com (go-live)

**Qué es:** Apuntar el dominio actual (WordPress viejo) a la web nueva en Vercel.

**Pasos:**

1. **Tú** preguntas al cliente: **¿en qué registrador está el dominio?** (GoDaddy, Namecheap, IONOS, Hostinger, OVH, 1&1, Arsys…). Si no lo sabe, lo averiguamos con `whois grupolambea.com`.
2. **Tú** consigues acceso al panel DNS — o que el cliente esté listo para pegar registros cuando se los pasemos.
3. **Tú** lo apuntas en `secretos-cliente.local.docx` **sección 4**.
4. **Yo** te paso los registros exactos a añadir:
   - **A** o **CNAME** para apuntar a Vercel (Vercel te los da en `vercel domains add`)
   - Los 3 de Resend del paso 3
   - (opcional) **CAA** restringiendo emisión de certificados
5. **Tú** los metes en el panel DNS del registrador.
6. **Yo** añado el dominio en Vercel: `vercel domains add grupolambea.com`.
7. **Esperar propagación** (minutos – 24 h).
8. **QA completa** antes de avisar al cliente: home, fichas de producto, checkout en modo test, formulario de contacto, admin.

⚠️ **Cuidado go-live:** las imágenes de producto **se sirven aún del WordPress viejo** (`next.config.ts` lo permite). Si el cliente apaga WordPress sin migrar imágenes a Vercel Blob, **se rompen las fichas**. Decisión: o (a) mantener WordPress vivo como CDN de imágenes, o (b) migrar imágenes primero (`E10` en pendientes). Ver bloque 7.

---

## 5. FactuCont (cliente sigue facturando manual)

**Qué es:** Programa local de facturación (no SaaS, no API web). Decisión 14/06: el cliente sigue con él. No se integra; le facilitamos el trabajo en el panel.

**Pasos:**

1. **Tú** preguntas al cliente:
   - ¿Qué versión usa? (FactuCont 5 / 6 / otro)
   - ¿Soporta su versión "Importar facturas desde CSV"? Mírelo en su menú; si no lo sabe, screenshot.
   - Si sí soporta CSV: que mande screenshot del cuadro de "Importar" para saber columnas/formato.
   - ¿Prefiere "**ficha imprimible**" del pedido (formato A4 listo para teclear en FactuCont)?
   - ¿También quiere "**marcar como facturada**" en el panel cuando termine (apuntar nº correlativo + opcional subir PDF)?
   - ¿Quiere recibir email automático con la ficha del pedido + datos fiscales del comprador en cuanto entre cada pedido nuevo?
2. **Tú** rellenas en `secretos-cliente.local.docx` **sección 5**.
3. **Yo** construyo lo que prefiera (bloque B de `pendientes-vivos.md`).

---

## 6. Vercel (hosting)

**Qué es:** Donde corre la web nueva.

**Pasos:**

1. **Tú** decides titularidad del proyecto: ☐ tu cuenta de agencia  ☐ cuenta del cliente.
2. Si va a ser del cliente: crear cuenta Vercel para él, invitarte a ti como colaborador, transferir el proyecto.
3. **Yo** cargo todas las variables `secretos-cliente.local.docx` → Vercel:
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   vercel env add RESEND_API_KEY production
   vercel env add CONTACT_FROM_EMAIL production
   vercel env add CONTACT_TO_EMAIL production
   vercel env add GENEI_API_KEY production
   ```
4. **Yo** hago el deploy de producción y verifico.

---

## 7. Imágenes del WordPress viejo

**Contexto:** las fichas de producto cargan imágenes desde `https://grupolambea.com/wp-content/...`. Si apagamos WordPress al hacer go-live, se rompen.

**Opciones:**
- **A. Mantener WordPress vivo como CDN.** Simple. El cliente conserva su contrato de hosting WP. Ojo: si el cliente lo apaga sin avisar, se rompe.
- **B. Migrar imágenes a Vercel Blob ahora.** Más limpio, más rápido (CDN Vercel), más caro si hay muchas. Yo puedo automatizarlo: descargar todas las URLs `wp-content/*` de la DB y subirlas con `@vercel/blob`.

**Decisión:** confirmar con el cliente antes del go-live.

---

## 8. Orden recomendado

> DNS es lo **último**: primero todo lo demás tiene que funcionar y estar probado en `preview`. El cambio de dominio es el último paso.

1. **Stripe LIVE** + webhook (cuenta del cliente activa + claves live → desbloquea cobros reales).
2. **Decisión Resend**: ¿con marca propia desde el día 1, o apaño con recibos de Stripe? Ver bloque 3 y 10.
3. **GENEI** — mandar email a su comercial pidiendo API. Es lo que más tarda en negociar; mientras llega, todo lo demás avanza.
4. **FactuCont** — preguntar al cliente sus preferencias. En paralelo, construyo la "ficha imprimible + marcar como facturada".
5. **Vercel** — decidir titularidad del proyecto.
6. **Migración de imágenes** (decisión bloque 7) o pacto explícito de mantener el WordPress viejo solo como CDN.
7. **QA completa** en preview con dominio temporal de Vercel.
8. **Go-live (DNS)**: A/CNAME a Vercel + registros de Resend si lo activamos. **Esto se hace lo último**, una vez todo lo anterior está probado.

## 10. ¿Hace falta Resend?

**No es bloqueante para arrancar.** La web ya llama a `sendOrderConfirmationEmail()` al crear el pedido y a `sendOrderShippedEmail()` al pasar a "enviado": ambas son **no-op silencioso** si `RESEND_API_KEY` falta. En cuanto se enchufe, los emails salen solos.

**Cómo arrancar sin Resend (apaño temporal):**
- Activar **Customer email receipts** en Stripe (`Settings → Emails → Customer emails`). Manda un recibo de pago estándar al comprador (sin marca Grupo Lambea ni número de pedido propio, pero gratis y automático).
- El formulario de contacto se queda sin acuse al visitante; los mensajes sí llegan al admin.

**Qué se gana al enchufar Resend después:**
- Email "Pedido confirmado · {Nº} — Grupo Lambea" con marca propia.
- Email "tu pedido va de camino" con enlace de tracking de GENEI cuando esté.
- Acuse del formulario de contacto al visitante.
- A futuro: email "tu factura" con PDF adjunto cuando se marque emitida en FactuCont.

**Recomendación:** activar Resend desde el día 1 si el cliente quiere imagen profesional. Si quiere arrancar ya y dejarlo para fase 2, no pasa nada — todo está cableado.

---

## 9. Recordatorios útiles

- Variables de entorno reales → `.env.local` (gitignored). Plantilla → `.env.example`.
- Si te equivocas pegando una key en el chat → **rótala inmediatamente** y guárdala solo en `secretos-cliente.local.docx`.
- Antes de cada cosa importante en producción: revisamos juntos en `preview` primero.
- Nunca pushearé ni desplegaré sin tu OK explícito.
