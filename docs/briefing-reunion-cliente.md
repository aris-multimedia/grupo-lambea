# Briefing — Reunión Francisco Lambea
**Fecha reunión:** 21 mayo 2026  
**Preparado por:** Adrià / Arismultimedia

---

## Estado actual del proyecto

El análisis técnico está hecho, el catálogo está estructurado (51 fichas de producto, 18 familias) y el prototipo visual funciona. **Lo que necesitamos resolver mañana son las decisiones de negocio** que no podemos tomar nosotros.

---

## STACK DEFINITIVO (actualizado)

| Capa | Herramienta | Coste |
|------|-------------|-------|
| Framework | Next.js 15 (App Router) | Gratis |
| Base de datos | Supabase (PostgreSQL) | Gratis hasta 500MB |
| Pagos | Stripe | 1,4% + €0,25/tx |
| Envíos | Sendcloud o direct carrier API | Ver más abajo |
| Hosting | Vercel | Gratis / €20/mes Pro |
| Admin | Panel propio (no Sanity) | — |

**Por qué Supabase ahora:** Con panel de administración propio, necesitamos base de datos real para productos, pedidos y logística. Supabase da PostgreSQL + autenticación + APIs instantáneas. Para 50 productos y cientos de pedidos es más que suficiente y gratuito.

---

## 1. LOGÍSTICA Y ENVÍOS — El tema central

### Problema a resolver
Cuando llegue un pedido a la web, Francisco necesita:
1. Ver el pedido en un panel (qué se pidió, dirección de entrega, datos del cliente)
2. Crear el envío con el transportista (imprimir etiqueta)
3. Que el cliente reciba email automático con número de seguimiento
4. Poder rastrear el envío desde el mismo panel

### Opción A — Sendcloud (recomendado para empezar)

**Qué es:** Plataforma de gestión de envíos multi-transportista. Líder en España y Europa. Francisco gestiona todo desde su dashboard.

**Transportistas disponibles:** SEUR, MRW, GLS, Correos Express, DHL, UPS, Nacex, entre otros. Acceso a todos con una sola cuenta.

**Flujo real:**
1. Cliente compra en la web → pedido llega a Sendcloud automáticamente (webhook)
2. Francisco abre Sendcloud → ve el pedido → elige transportista y tarifa
3. Hace clic en "Crear envío" → se genera la etiqueta → la imprime
4. Sendcloud manda email automático al cliente con tracking
5. Francisco puede ver el estado del envío en tiempo real

**Precio:**
- Plan Starter: ~€25/mes (hasta 400 envíos/mes) o pay-per-shipment
- Las tarifas de transportista son mejores que las que negociaría solo (volumen agregado)
- **Importante:** preguntarle a Francisco cuántos pedidos al mes espera. Si son menos de 50/mes, mejor plan básico o incluso por envío.

**Por qué es la opción correcta aquí:**
- Integración nativa con nuestro stack (API REST + webhooks)
- Francisco no necesita negociar con cada transportista por separado
- Panel propio de Francisco en sendcloud.com — sencillo, en español
- Ya tienen tarifas negociadas con SEUR, MRW, etc.
- Seguimiento automático sin desarrollo adicional

**Nuestro trabajo de integración:**
- Webhook: cuando Stripe confirma pago → creamos pedido en Sendcloud API → pedido aparece en dashboard de Francisco
- Nada más. Sendcloud hace el resto.

---

### Opción B — Contrato directo con transportista (SEUR, MRW, GLS…)

**Pros:**
- Francisco negocia tarifa directamente según su volumen
- Si ya tiene relación con un transportista, más fácil

**Contras:**
- Solo un transportista (sin comparar precios)
- Integración API más compleja (cada transportista tiene su API diferente)
- El panel de tracking es el del transportista, no nuestro
- Francisco tiene que llamar para abrir cuenta y negociar tarifa

**Cuándo tiene sentido:** Si Francisco ya tiene cuenta con SEUR o MRW y buena tarifa negociada, integramos ese directamente. Sendcloud también puede conectar esa cuenta y añadir el resto.

---

### Opción C — Panel propio de envíos (máximo control, más desarrollo)

Construimos dentro del admin de Francisco una sección de gestión de envíos completamente personalizada.

**Pros:** Todo en un solo sitio, branding 100% Lambea
**Contras:** 2-3 semanas extra de desarrollo, hay que integrar cada carrier API, mantener el código si cambian las APIs

**No recomendamos esta opción** para arrancar. Sendcloud resuelve el problema mejor y más rápido. Si en el futuro quiere algo más personalizado, se puede hacer.

---

## 2. PANEL DE ADMINISTRACIÓN PROPIO (en lugar de Sanity)

### Qué incluirá el panel de Francisco

**Acceso:** URL privada tipo `admin.grupolambea.com` o `/admin` con usuario y contraseña

**Módulo Pedidos:**
- Lista de todos los pedidos (nuevo, procesando, enviado, entregado)
- Detalle de cada pedido: productos, cantidades, datos cliente, dirección
- Botón "Crear envío" → conecta con Sendcloud o carrier
- Estado de envío en tiempo real (tracking integrado)
- Reenviar email de confirmación al cliente

**Módulo Productos:**
- Lista todos los productos con foto, precio, stock
- Editar precio, descripción, imágenes sin tocar código
- Activar/desactivar producto (sin borrarlo)
- Subir nueva foto

**Módulo Configuración:**
- Activar/desactivar promoción 3×2
- Editar texto del banner promocional
- Configurar costes de envío

**Lo que NO incluye** (para no inflar el desarrollo):
- Estadísticas avanzadas (eso está en Stripe dashboard)
- Gestión de usuarios múltiples (Francisco es el único)
- ERP ni contabilidad

---

## 3. PASARELA DE PAGO — ¿Stripe o Redsys?

**Stripe** (recomendación):
- Sin cuota mensual, 1,4% + €0,25 por transacción europea
- Se activa online en minutos, sin contratos
- Apple Pay y Google Pay incluidos
- Dashboard claro para ver cobros, reembolsos, disputas

**Redsys** (TPV virtual de banco):
- Necesita contrato con su banco (BBVA, CaixaBank, Sabadell…)
- Cuota mensual (~15-30€ según banco) + comisión
- Más familiar para clientes españoles mayores

**Pregunta:** ¿Tiene ya TPV virtual con su banco o prefiere arrancar sin cuota fija?

---

## 4. PROMOCIÓN 3×2 — Aclarar la lógica exacta

Lo que tenemos implementado en el prototipo: compra 3 unidades (pueden ser productos distintos) → la más barata sale gratis.

Necesitamos confirmar:
- **¿Es permanente o tiene fecha de fin?** → Si temporal, el admin tiene un toggle para activarla/desactivarla
- **¿Aplica a TODOS los productos?** → ¿O HIPICLAM (1.700€) queda excluido?
- **¿Mezcla de productos?** → 1 DESOXILAM + 1 TAPILAM + 1 FOSSLAM = ¿el más barato gratis?

---

## 5. SEO — Qué ganamos con el rediseño

### Garantizado desde el día del lanzamiento:
- URLs limpias: `/tienda/desoxilam-nautico` en lugar de 150 caracteres
- Schema markup de producto: precio y estrellas aparecen directamente en Google
- Velocidad x5 respecto a WordPress + Elementor
- Canonical tags: las 3 versiones del mismo producto no compiten entre sí
- Redirecciones 301: el posicionamiento actual no se pierde

### Palabras clave con mejor oportunidad (poca competencia en España):
1. "limpiador inyectores diesel" → INYECLAM DIESEL (bestseller)
2. "aditivo pre ITV" → caso de uso muy buscado antes de pasar ITV
3. "limpiador fibra vidrio barco" → nicho náutico, competencia mínima
4. "sistema anticaídas jinete" → HIPICLAM, competencia prácticamente cero
5. "desoxidante concentrado inox" → DESOXILAM

### Para SEO de contenido (blog):
El blog es clave para posicionar en búsquedas informativas. Arrancar con 3-4 artículos técnicos: "Cómo limpiar los inyectores diesel antes de la ITV", "Guía para mantener la madera teca de un barco", etc.

---

## 6. PREGUNTAS PARA LA REUNIÓN (checklist)

**Logística y envíos:**
- [ ] ¿Cuántos pedidos al mes espera gestionar? (para elegir plan Sendcloud)
- [ ] ¿Tiene ya contrato con algún transportista? (SEUR, MRW, GLS…)
- [ ] ¿Conoce Sendcloud? ¿O prefiere integración directa con su transportista habitual?
- [ ] ¿Quién imprime las etiquetas? ¿Francisco en su impresora? ¿Tiene impresora de etiquetas?

**Pagos:**
- [ ] ¿Stripe o Redsys? ¿Tiene TPV virtual con su banco?

**Promoción 3×2:**
- [ ] ¿Permanente o con fecha de fin?
- [ ] ¿Todos los productos o hay exclusiones?
- [ ] ¿Se puede mezclar cualquier producto?

**Panel de administración:**
- [ ] ¿Es el único que va a gestionar el panel o habrá más usuarios?
- [ ] ¿Tiene ordenador o trabaja principalmente desde móvil?

**Contenido y SEO:**
- [ ] ¿Tiene acceso a Google Search Console?
- [ ] ¿Tiene fotos de producto en alta resolución (originales)?
- [ ] ¿Google My Business activo con reseñas?
- [ ] Blog: ¿quién escribe? ¿o lo dejamos para fase 2?

**HIPICLAM:**
- [ ] ¿Se vende online o solo por consulta/presupuesto?

---

## 7. IMPACTO EN ALCANCE Y PLAZO

Con panel propio + integración de logística, el proyecto es más ambicioso que la propuesta inicial. Estimación ajustada:

| Fase | Semanas | Contenido |
|------|---------|-----------|
| Fase 1 — Frontend | 4-5 sem | Home, catálogo, fichas de producto, carrito |
| Fase 2 — Checkout | 2-3 sem | Stripe, pedidos, emails automáticos |
| Fase 3 — Admin + Logística | 3-4 sem | Panel Francisco, integración Sendcloud/carrier |
| Fase 4 — SEO y contenido | 1-2 sem | Schema markup, sitemap, blog, redirecciones |
| **Total estimado** | **10-14 sem** | — |

---

*Preparado con todo el contexto del catálogo, análisis técnico y prototipo existente — mayo 2026.*
