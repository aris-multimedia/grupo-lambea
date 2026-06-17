# Qué puede hacer Claude (y qué no) en este proyecto

> Honesto. Lo que NO puedo es importante saberlo para no esperar a que yo resuelva algo que necesita acción humana.

## ✅ Puedo hacer

### Código y datos del proyecto
- Leer y editar cualquier archivo del repo `Grupo Lambea/`.
- Ejecutar `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm run dev`.
- Arrancar el dev server y abrirlo en navegador headless (skill `browse`/`gstack`) o pedirte captura.
- Ejecutar SQL contra Neon (vía `lib/db.ts` y scripts ad-hoc).
- Hacer commits localmente (con tu permiso explícito; nunca por mi cuenta).
- Crear PRs en GitHub vía `gh` (con tu permiso).
- Hacer deploys a Vercel preview/producción con `vercel deploy` (solo si me lo pides).

### APIs externas (cuando tengo credenciales en `.env.local` o `secretos-cliente.local.docx`)
- Llamar a Stripe (cobros, refunds, webhooks, crear endpoints).
- Llamar a Resend (enviar emails, verificar dominios, gestionar audiences).
- Llamar a GENEI cuando tenga la API key (crear envíos, etiquetas, tracking).
- Probar endpoints con `curl` y ver respuestas.

### Documentación / comunicación
- Redactar emails para que tú los mandes: al cliente, a GENEI, a Resend, a la gestoría.
- Redactar copy de la web (legal, contacto, microcopy).
- Generar checklist / playbooks / docs internos como este.
- Generar plantillas de email transaccional, tarjetas de prueba Stripe, scripts QA.

### Operativo
- Generar los registros DNS exactos que tienes que pegar en el panel del registrador.
- Configurar webhooks de Stripe vía CLI / dashboard (con tu acceso developer).
- Verificar dominios en Resend (con la API key).
- Cargar variables en Vercel (`vercel env add`).

---

## ❌ NO puedo hacer

### Cuentas y trámites externos
- **Crear cuentas** en plataformas (Stripe, GENEI, Resend, Vercel...). Eso lo haces tú o el cliente.
- **Pasar KYC, firmar términos, aceptar contratos.** Cualquier "estoy de acuerdo y firmo" es humano.
- **Acceder a paneles del cliente** sin que tú me pases el acceso (cookies, sesión, invitación).
- **Hacer cobros reales** sin que la cuenta del cliente esté activa y tú me autorices.

### Mundo físico y comunicaciones
- **Hablar por teléfono** con soporte de GENEI ni nadie.
- **Mandar emails reales** desde tu cuenta (te redacto el borrador, lo mandas tú).
- **Enviar paquetes / imprimir etiquetas físicas.**
- **Verificar pesos reales** de productos (los pesa el cliente).

### Información que no tengo y no puedo inventar
- **Formato exacto de importación** de la versión concreta de FactuCont del cliente (no puedo abrir su programa).
- **Pesos reales** por formato.
- **Tarifas definitivas** de GENEI (las negocia el cliente).
- **Decisiones de negocio**, precios, condiciones legales, política comercial.

### Acciones destructivas o de alto impacto (no las haré sin tu OK explícito por cada una)
- `git reset --hard`, `git push --force`, `DROP TABLE`, `rm -rf`, `vercel rm`, borrar branches o tags.
- Modificar `schema.sql` o migrar la DB de Neon en producción.
- Pushear a `main`.
- Deploy a Vercel **producción**.
- Tocar `lib/invoicing.ts` (la regla "factura solo al completado" es no negociable).
- Instalar dependencias nuevas grandes sin acordarlo.

---

## 🟡 Puedo, pero te pregunto antes

- Cambios en `schema.sql` / migraciones Neon.
- Push a remoto.
- Deploy a producción.
- Cambios estructurales de carpetas o renombrados masivos.
- Eliminar archivos del repo.

---

## 📁 Dónde guardamos qué

| Tipo | Dónde | ¿Se sube a git? |
|---|---|---|
| Credenciales del cliente, APIs, datos sensibles | `secretos-cliente.local.docx` (raíz del repo) | **No** (gitignored) |
| Variables de entorno reales | `.env.local` (raíz del repo) | **No** (gitignored) |
| Plantilla de variables de entorno | `.env.example` | Sí |
| Pendientes vivos | `docs/pendientes-vivos.md` | Sí |
| Playbook por servicio | `docs/pasos-operativos.md` | Sí |
| Diseño del sistema de pedidos/facturación | `docs/sistema-pedidos-facturacion.md` | Sí |
| Reunión con cliente / checklist puesta en marcha | `docs/puesta-en-marcha.md` | Sí |

---

## 📡 Variables de entorno en Vercel

Cuando una credencial pasa de `secretos-cliente.local.docx` a estar lista para producción, la subo yo con:

```bash
vercel env add STRIPE_SECRET_KEY production
# (pega valor; me sale el prompt — lo paso a Vercel)
```

Lo mismo para `preview` si queremos previews funcionales. La lista canónica de variables está en `.env.example`.
