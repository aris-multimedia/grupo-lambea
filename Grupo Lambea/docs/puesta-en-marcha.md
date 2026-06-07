# Grupo Lambea — Puesta en marcha del e-commerce

Checklist para la reunión con el cliente. Ve punto por punto: lo que ya está hecho,
lo que hay que pedir/decidir, y en qué orden activarlo.

---

## 1. Estado actual

**Ya hecho (no necesita nada del cliente):**
- Web completa: home, catálogo, fichas, nosotros, contacto, legales, carrito, checkout.
- Carrito + **promo 3×2** funcionando (se calcula y se muestra el descuento).
- Checkout con datos de contacto, dirección y **facturación** (particular/empresa + opción "necesito factura" con NIF).
- **Formulario de contacto** cableado (listo para enviar en cuanto haya Resend).
- **Newsletter** del footer y **checkbox de marketing** en el checkout: capturan suscriptores **con consentimiento** (RGPD) en la base de datos desde ya.
- SEO migrado (redirects, metadata, etc.).

**Pendiente (necesita cuentas externas / decisiones del cliente):** cobro real (Stripe),
envío (GENEI), envío de emails (Resend) y la facturación. Todo lo de abajo.

---

## 2. Cuentas y accesos a pedir al cliente

> Marca cada uno según se vaya consiguiendo en la reunión.

### [ ] 1. Stripe — cobros  *(cuenta del cliente)*
- El cliente crea la cuenta a nombre de **TECNICLAM 2016 SL**, completa el KYC (CIF + DNI del representante) y mete su **IBAN**.
- **Me entrega:** acceso como **Developer** a su cuenta, **o** las claves `sk_` y `pk_` (test + live).
- El **webhook secret** (`whsec_…`) lo genero yo en su panel.
- Notas: precios con **IVA 21% incluido**. La factura **NO** la hace Stripe (la hace el gestor). Opcional: subir su logo a Stripe.

### [ ] 2. GENEI.es — envíos  *(cuenta del cliente)*
- El cliente se da de alta y **pide a GENEI el acceso a su API**.
- **Me entrega:** API key/token + **documentación de la API** + **dirección de origen** (remitente) + qué mensajerías usará.
- **Además:** los **pesos reales de cada formato** de producto (botella 1 L ≈ ?, 500 g ≈ ?, …) → hacen falta para generar la etiqueta. *(Hoy no existe el dato en la base de datos.)*

### [ ] 3. Acceso al DNS de grupolambea.com
- **Me entrega:** acceso al panel DNS **o** disposición a añadir los registros que le pase.
- Para: verificar el dominio de email (Resend) y, al final, **apuntar el dominio a la web nueva**.

### [ ] 4. Correos de destino
- **Me confirma:** a qué correo deben llegar el **formulario de contacto** y el **aviso de cada pedido**; y, si el gestor factura, **el email del gestor**.

### [ ] 5. Facturación  *(decisión)*
- **Le pregunto:** *¿con qué programa de facturación / gestoría trabaja y tiene API?*
  - Con API (Quaderno, Holded, Factura Directa, Sage, A3…) → se puede **automatizar** (la factura sale a su nombre, con numeración correlativa e IVA 21%).
  - Sin API → **semiautomático**: la web le manda cada pedido (con NIF) al gestor y él la emite.
- La factura siempre la emite **el cliente/su gestor**, no Stripe.

### [ ] 6. Dominio / hosting actual  *(go-live)*
- **Me entrega:** acceso a dónde está registrado/alojado `grupolambea.com` hoy (WordPress antiguo).
- **Decidir:** ¿se mantiene el WordPress vivo (las fotos de producto aún se sirven de ahí) o las migramos antes de apagarlo?

### [ ] 7. Email marketing  *(decisión)*
- **¿Las campañas las envías tú o el cliente?**
  - Tú → **Resend** (misma cuenta, lo más simple).
  - El cliente con editor visual → **Brevo** o **Mailchimp**.

### [ ] 8. Vercel — hosting de la web nueva  *(agencia)*
- Decidir titularidad (a nombre de la agencia o del cliente). Aquí cargo todas las variables de entorno.

---

## 3. Decisiones ya tomadas (para no repetir)
- **Factura:** la emite el gestor del cliente. **NO** se usa la factura de Stripe.
- **IVA:** 21% en todo, incluido en los precios.
- **Email marketing:** con **consentimiento** explícito (ya implementado).
- **Productos descatalogados** (GELCOATLAM, ANTIDESLILAM, discos): se quedan fuera; sus URLs antiguas redirigen a su categoría para no perder SEO.

---

## 4. Fase 2 (más adelante, no ahora)
- **Cupones/códigos únicos** en los emails de confirmación (Stripe Promotion Codes o tabla propia).
- **Email de confirmación con marca propia** (Resend) además del recibo de Stripe.
- **Cálculo del coste de envío por CP** en el checkout vía GENEI.
- **Migrar las imágenes** del WordPress viejo a Vercel Blob.

---

## 5. Orden de activación recomendado
1. **Stripe** (cobro) — es lo que desbloquea vender.
2. **GENEI** (envío) — se genera tras el pago.
3. **Resend** (emails) — confirmaciones y contacto.
4. **Dominio / go-live** — apuntar grupolambea.com a la web nueva cuando todo lo anterior funcione.

> Variables de entorno de todo esto: ver **`.env.example`** en la raíz del proyecto.
