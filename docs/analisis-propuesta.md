# Análisis Web y Propuesta de Rediseño — Grupo Lambea
**Preparado por:** Adrià (con asistencia de Claude)
**Fecha:** Abril 2026
**URL actual:** http://grupolambea.com/

---

## 1. RESUMEN EJECUTIVO

Grupo Lambea es una empresa familiar fundada en 1952, con más de 70 años de historia en el sector de productos de limpieza y mantenimiento especializados. Su web actual, construida sobre WordPress + WooCommerce + Elementor, funciona pero presenta problemas significativos de rendimiento, SEO técnico y accesibilidad que están limitando su visibilidad online y la tasa de conversión.

**Propuesta:** Reconstruir la web con código limpio (Next.js), manteniendo la estética familiar y de confianza que ya tiene, pero con mejoras radicales en velocidad, SEO, accesibilidad y gestión de contenido.

---

## 2. ANÁLISIS DE LA WEB ACTUAL

### 2.1 Estructura y Contenido

**Páginas principales:**
- Inicio
- Experiencia (historia de la empresa)
- Tienda (catálogo general)
- Productos Náuticos
- Productos Caravaning
- Productos Industriales
- Discos y Abrasivos
- Sistema Hipiclam (anticaídas hípica)
- Contacto
- Blog (2 artículos)

**Catálogo de productos:**
- **50 productos** indexados en el sitemap
- **50+ categorías y subcategorías**
- 18 familias de productos con variantes por sector (Náutico / Caravaning / Industrial)
- Precios desde 7,50€ (desoxidante pequeño) hasta 1.700€ (sistema Hipiclam)
- Formatos: 125ml, 250ml, 500ml, 1L, 5L, 25L (según producto)

**Familias de producto identificadas:**
1. ANTIDESLILAM — antideslizante superficies
2. DECALAM — decapante gel soldaduras inox
3. DESOXILAM — desoxidante enérgico concentrado ★ Más ventas
4. FIBRALAM — limpiador blanqueador fibra vidrio/gelcoat
5. FOSSLAM — limpiador WC portátiles/químicos 4en1
6. GELCOATLAM (Fase 1 y 2) — pastas de pulir gelcoat
7. INYECLAM DIESEL — aditivo limpiador inyectores diesel ★ Más ventas
8. INYECLAM GASOLINA — aditivo limpiador inyectores gasolina
9. MANZALAM — limpiador multiusos ecológico (vinagre manzana)
10. MOTORLAM — desengrasante motores con efecto desodorante
11. PASTA ROSA SUPERBRILLO — pulimento metales a máquina (1ª fase)
12. PASTA VERDE SUPERBRILLO — pulimento metales superbrillo (2ª fase)
13. PLASTILAM — pulimento plásticos y faros
14. PROTECLAM — abrillantador con siliconas anti-huella
15. PULIMENTO SUPERBRILLO — pulimento metales a mano
16. TAPILAM — limpiador moquetas y tapicerías
17. TEKALAM — protector madera
18. HIPICLAM — sistema anticaídas para hípica (producto premium)
19. DISCOS Y ABRASIVOS — discos cuerda y algodón para pulido

### 2.2 Problemas de SEO Técnico

| Problema | Impacto | Ejemplo |
|----------|---------|---------|
| URLs extremadamente largas | Alto | `/producto/desoxilam-nautico-desoxidante-energico-con-efecto-pasivante-no-efecta-a-plasticos-pintura-y-otras-instalaciones-1-litro-desincrustante-barco/` |
| Slugs con descripción completa en URL | Alto | Las URLs deberían ser `/producto/desoxilam-nautico/` |
| Duplicación de contenido | Alto | Mismo producto en 3 variantes (náutico/caravaning/industrial) sin canonical tags bien configuradas |
| Sin schema markup de producto | Alto | Google no muestra precio/valoración en resultados de búsqueda |
| Solo 2 artículos de blog | Medio | El blog es clave para SEO de cola larga |
| No hay sitemap de imágenes | Medio | Las imágenes de producto no se indexan en Google Images |
| H1 tags posiblemente incorrectos | Medio | Elementor a veces genera estructura de headings incorrecta |

### 2.3 Problemas de Accesibilidad

- **Texto de botones:** Elementor a menudo genera botones sin texto alternativo correcto
- **Contraste de colores:** Difícil de verificar sin herramientas directas, pero WordPress + temas suele fallar en WCAG AA
- **Tamaño de fuente:** Para público mayor es crucial (mínimo 16px, mejor 18px)
- **Navegación por teclado:** WooCommerce estándar tiene problemas con foco visible
- **Alt text en imágenes de producto:** Requiere configuración manual en WooCommerce, a menudo incompleto
- **Formulario de contacto:** Sin etiquetas accesibles en muchos temas
- **Tap targets:** En móvil, botones y enlaces deben tener mínimo 44x44px

### 2.4 Problemas de Rendimiento

- **Elementor:** Genera CSS/JS masivo, aumenta el tamaño de página considerablemente
- **WooCommerce:** Carga scripts en todas las páginas, aunque no haya carrito
- **WordPress + plugins:** Múltiples plugins (Yoast, Elementor, WooCommerce) = muchos recursos
- **Sin lazy loading configurado:** Las imágenes probablemente se cargan todas de golpe
- **TTFB alto:** Hosting compartido típico de WordPress = Time To First Byte lento
- **No usa CDN:** Las imágenes se sirven directamente desde el servidor

### 2.5 Problemas de UX / Conversión

- La promoción "3x2" no es visible de forma prominente en la home
- Los productos se duplican en 3 versiones (náutico/caravaning/industrial) con URLs diferentes — confunde al usuario
- No hay filtros de búsqueda por familia de producto o formato
- La navegación por subcategorías es profunda (3 niveles)
- No hay comparador de productos

---

## 3. PROPUESTA DE REDISEÑO

### 3.1 Stack Tecnológico Propuesto

```
Frontend:    Next.js 15 (App Router)
Estilos:     Tailwind CSS
UI:          shadcn/ui (componentes accesibles por defecto)
Carrito:     Stripe o Mercado Pago (simple, sin WooCommerce)
CMS:         Sanity.io o Notion API (para que el cliente gestione productos)
Deploy:      Vercel (CDN global, edge computing, HTTPS automático)
SEO:         Metadata API de Next.js + JSON-LD schema markup
Imágenes:    next/image (optimización automática, lazy loading, WebP)
```

**Por qué este stack para Grupo Lambea:**
- **Velocidad:** Next.js genera HTML estático en build time → 0ms de PHP, sin base de datos en producción
- **SEO nativo:** Metadata API, sitemap automático, schema markup de producto sin plugins
- **Accesibilidad:** shadcn/ui usa Radix UI, que cumple WCAG 2.1 AA por diseño
- **Mantenimiento:** El cliente puede editar productos en Sanity (interfaz visual simple)
- **Coste:** Vercel hobby plan = gratuito; Sanity = gratuito hasta 25GB

### 3.2 Estructura de Páginas Propuesta

```
/                           → Home con hero, categorías y destacados
/tienda                     → Catálogo con filtros
/tienda/[slug]              → Página de producto
/nautico                    → Hub de productos náuticos
/caravaning                 → Hub de productos caravaning
/industrial                 → Hub de productos industriales
/hipica                     → Sistema Hipiclam
/discos-abrasivos           → Discos y abrasivos
/experiencia                → Historia empresa
/blog                       → Listado artículos
/blog/[slug]                → Artículo individual
/contacto                   → Formulario + mapa
```

### 3.3 Mejoras de SEO Propuestas

1. **URLs limpias:** `/tienda/desoxilam-nautico` en lugar de URLs de 150 caracteres
2. **Schema markup:** Product schema con precio, disponibilidad y valoraciones → stars en Google
3. **Canonical tags automáticas** para las variantes del mismo producto
4. **Sitemap.xml dinámico** generado automáticamente con todas las páginas y productos
5. **Open Graph** para redes sociales (cuando compartan un producto en Facebook/Instagram)
6. **Blog optimizado** con contenido para palabras clave de cola larga:
   - "cómo limpiar gelcoat barco"
   - "limpiador inyectores diesel caravana"
   - "protector madera teca barco"

### 3.4 Mejoras de Accesibilidad Propuestas

- Tamaño de texto base: **18px** (público mayor)
- Contraste mínimo WCAG AA en todos los textos
- Navegación por teclado con foco visible siempre
- Alt text descriptivo en todas las imágenes (gestionado desde Sanity)
- Botones con tamaño mínimo 48x48px en móvil
- Formulario de contacto con etiquetas correctas y mensajes de error claros
- Compatibilidad con lectores de pantalla

### 3.5 Diseño Visual — Mantener la Esencia

El cliente ha indicado que **el aspecto visual actual le gusta**. La propuesta es evolucionar, no romper:

- **Paleta de colores:** Mantener los azules náuticos + blanco + toques dorados/amarillos
- **Tipografía:** Fuente clara y legible (Nunito Sans o similares), tamaño generoso
- **Estilo:** Limpio y profesional, sin elementos ultra-modernos ni animaciones complejas
- **Fotografía:** Las fotos de producto existentes se reutilizan, optimizadas para web
- **Tono:** Confianza, tradición y calidad — refleja los 70+ años de historia

---

## 4. ANÁLISIS COMPETITIVO (SEO)

### Palabras clave objetivo identificadas

| Keyword | Volumen estimado | Dificultad | Producto |
|---------|-----------------|------------|---------|
| limpiador inyectores diesel | Alto | Media | Inyeclam Diesel |
| aditivo pre itv | Medio | Baja | Inyeclam Pre ITV |
| limpiador fibra vidrio barco | Medio | Baja | Fibralam Náutico |
| desoxidante inox barco | Bajo | Muy baja | Desoxilam Náutico |
| limpiador gelcoat caravana | Bajo | Muy baja | Fibralam Caravaning |
| protector madera teca | Bajo | Baja | Tekalam Náutico |
| limpiador wc portátil caravana | Bajo | Muy baja | Fosslam Caravaning |
| pulimento metales a mano | Bajo | Baja | Pulimento Superbrillo |
| sistema anticaídas jinete | Muy bajo | Muy baja | Hipiclam |

**Oportunidad:** Los productos de Lambea son muy específicos y tienen poca competencia SEO en España. Con contenido bien optimizado pueden posicionarse en el top 3 para nichos como "limpiadores náuticos concentrados" sin competir con grandes marcas.

---

## 5. ROADMAP DE IMPLEMENTACIÓN

### Fase 1 — Base (4-6 semanas)
- [ ] Setup Next.js + Tailwind + shadcn/ui
- [ ] Diseño y componentes base (header, footer, tarjeta producto)
- [ ] Home con hero, categorías y destacados
- [ ] Catálogo con filtros por categoría
- [ ] Páginas de producto con variantes

### Fase 2 — Contenido y SEO (2-3 semanas)
- [ ] Migración de todos los productos al nuevo sistema
- [ ] Schema markup de producto
- [ ] Blog con los 2 artículos existentes
- [ ] Sitemap automático
- [ ] Redirecciones 301 de URLs antiguas

### Fase 3 — Checkout (2-3 semanas)
- [ ] Integración Stripe o Redsys
- [ ] Carrito y proceso de pago
- [ ] Emails automáticos de confirmación
- [ ] Panel de gestión de pedidos

### Fase 4 — CMS y Formación (1-2 semanas)
- [ ] Setup Sanity para gestión de productos
- [ ] Formación al cliente para añadir/editar productos

---

## 6. ESTIMACIÓN DE COSTES

### Desarrollo (estimado)
- Fase 1 (base + catálogo): 40-60h
- Fase 2 (contenido + SEO): 20-30h
- Fase 3 (checkout): 30-40h
- Fase 4 (CMS + formación): 10-15h

### Hosting (mensual)
- Vercel Pro: 20€/mes (o gratuito en plan hobby)
- Sanity (CMS): 0€ hasta 25GB
- Dominio: ya existente
- **Total infraestructura:** ~20€/mes (vs. coste actual de hosting WordPress)

---

## 7. CONCLUSIONES

La web de Grupo Lambea tiene un catálogo sólido con productos bien diferenciados y valoraciones de clientes muy positivas (5/5 estrellas en la mayoría). El principal problema es técnico: la plataforma WordPress + WooCommerce + Elementor está limitando el rendimiento y el SEO.

La empresa tiene una historia de 70+ años que genera confianza, productos únicos de fabricación propia con registro toxicológico, y una base de clientes fiel. Con una web técnicamente correcta, el potencial de crecimiento online es muy significativo, especialmente en nichos de baja competencia como productos náuticos concentrados y el sistema Hipiclam.

**El rediseño propuesto no es un cambio de imagen, sino una modernización técnica** que respeta la estética y los valores de la marca mientras elimina las limitaciones actuales.

---

*Documento generado a partir de análisis técnico de grupolambea.com — Abril 2026*
