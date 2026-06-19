# Auditoría SEO y plan de keywords — Grupo Lambea

> Documento de **propuesta** (no aplica cambios por sí solo). Objetivo: mejorar el
> posicionamiento de palabras clave sin perder la equity heredada de la web
> antigua (WooCommerce + Yoast). Cruzar con la tienda real antes de editar.

## 1. Estado actual (lo que YA está bien — no tocar)

- **Títulos/meta de Yoast preservados verbatim**: `generateMetadata` en
  `app/(site)/tienda/[slug]/page.tsx` usa `seo_title` / `seo_description` de la DB
  y solo cae a un genérico si están vacíos. Esto conserva las keywords ya
  posicionadas. **Regla de oro: cualquier cambio se hace SOBRE estos campos, no
  borrándolos.**
- **Canonical + Open Graph + Twitter Card** en cada ficha.
- **JSON-LD `Product`** con `aggregateRating` y hasta 8 reseñas reales → habilita
  estrellas en resultados (rich snippets).
- **~85 redirects 301** de `/producto/*` y `/categoria-producto/*` a `/tienda/*`
  en `next.config.ts` → preserva enlaces entrantes.
- **`/buscar` con `noindex`** → evita contenido fino (thin content).

## 2. Carencias detectadas (oportunidades)

| Área | Problema | Impacto |
|---|---|---|
| Profundidad de contenido | Fichas con `descripcion_larga` corta o vacía (GELCOATLAM, DISCOS — ver inventario) | Google premia contenido útil y extenso |
| Keywords long-tail | Las subcategorías de la web antigua (p. ej. "limpiador inyectores diésel náuticos") son keywords valiosas poco explotadas en las fichas | Tráfico de intención de compra |
| Encabezados (H2/H3) | Las fichas no estructuran el contenido en secciones con keywords (Usos, Modo de empleo, Beneficios) | Relevancia semántica |
| `alt` de imágenes | Revisar que el `alt` incluya producto + aplicación ("Desoxilam náutico 1 L") | SEO de imágenes + accesibilidad |
| Enlazado interno | Pocas referencias cruzadas entre productos relacionados y categorías | Distribución de autoridad |
| `sitemap.xml` | `lastModified` debería reflejar `updated_at` real del producto, no la fecha de build | Frescura/crawl |
| hreflang | No existe (coherente: aún no hay i18n). Al añadir idiomas (#4) habrá que añadirlo | Internacional |

## 3. Patrón recomendado de title / meta (por ficha)

Mantener el de Yoast si ya rankea; cuando falte o sea flojo, usar:

- **`seo_title`** (≤ 60 car.): `{Producto} {Aplicación} {formato clave} | Grupo Lambea`
  - Ej.: `Desoxilam náutico desoxidante para barcos 1 L | Grupo Lambea`
- **`seo_description`** (140–155 car.): beneficio + keyword + prueba + CTA.
  - Ej.: `Desoxidante náutico concentrado con efecto pasivante. Elimina óxido de
    acero inox y aluminio. Fórmula registrada, fabricada en España. 3×2 en 1 L.`

## 4. Keywords objetivo por familia

Derivadas de las subcategorías reales de la web antigua (`data/productos.json`).
Primaria = la que da el título; secundarias = se reparten en H2/descripción.

| Familia | Keyword primaria | Secundarias (long-tail) |
|---|---|---|
| DESOXILAM | desoxidante náutico | quitar óxido acero inoxidable barco, desoxidante aluminio, pasivante |
| INYECLAM DIESEL | limpiador inyectores diésel | aditivo limpia inyectores náutico/coche, descarbonizar diésel pre-ITV |
| INYECLAM GASOLINA | limpiador inyectores gasolina | aditivo gasolina, limpieza válvulas admisión |
| FIBRALAM | limpiador fibra de vidrio | blanqueador gelcoat, limpiar casco barco fibra |
| GELCOATLAM | reparar gelcoat | kit gelcoat 2 fases, pulir gelcoat náutico |
| MOTORLAM | desengrasante motores | desengrasante industrial motor náutico, limpiamotores |
| MANZALAM | limpiador multiusos aroma manzana | desodorizante náutico/caravana |
| PROTECLAM | protector superficies | sellador hidrófugo, protección antimanchas |
| TEKALAM | limpiador teca | mantenimiento madera teca barco |
| TAPILAM | limpiatapicerías | limpiador tapicería náutica/caravana |
| FOSSLAM | desengrasante desincrustante | limpiador sentinas, fondos |
| PLASTILAM | limpiaplásticos / abrillantador plásticos | renovador plásticos salpicadero |
| ANTIDESLILAM | tratamiento antideslizante | barniz antideslizante cubierta/escaleras |
| DECALAM | decapante soldaduras inox | gel decapante acero inoxidable |
| PASTA ROSA/VERDE SUPERBRILLO | pasta de pulir | pasta pulir metales/gelcoat, abrillantado |
| PULIMENTO SUPERBRILLO | pulimento metales | abrillantador acero/aluminio |
| DISCOS Y ABRASIVOS | discos de pulir | disco algodón/cuerda pulido profesional |

## 5. Estructura de contenido recomendada por ficha (H2)

1. **Qué es / para qué sirve** (párrafo con keyword primaria) — `descripcion_larga`.
2. **Usos recomendados** (lista) — campo `usos`.
3. **Modo de empleo** — campo `instrucciones_uso`.
4. **Características / ventajas** — campo `caracteristicas`.
5. **Formatos disponibles** (ya lo cubren las variantes).
6. **FAQ** (2–3 preguntas con keywords) → candidato a `FAQPage` JSON-LD futuro.

## 6. Quick wins técnicos (bajo esfuerzo, alto impacto)

- [ ] Rellenar `descripcion_larga` de las familias vacías (ver inventario): GELCOATLAM, DISCOS Y ABRASIVOS.
- [ ] `sitemap.ts`: usar `updated_at` del producto como `lastModified`.
- [ ] Revisar `alt` de imágenes de producto → `"{familia} {aplicación} {formato}"`.
- [ ] Añadir bloque de "productos relacionados" enlazado (si no lo está) para enlazado interno.
- [ ] Texto introductorio (150–300 palabras) con keywords en las páginas de categoría `/tienda/{nautico|caravaning|industrial}`.

## 7. Trabajo que requiere persona / decisión

- Selección final de keywords objetivo por producto (con datos de volumen reales:
  Search Console, Keyword Planner, Ahrefs/Semrush).
- Redacción/curación de las descripciones largas definitivas (tono de marca).
- Validar que no se canibalizan keywords entre náutico/caravaning/industrial de la
  misma familia (considerar canonical entre aplicaciones si compiten).
- hreflang: se aborda junto con la internacionalización (#4).
