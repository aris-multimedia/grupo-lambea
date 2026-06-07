import type { NextConfig } from "next";

// 301 redirects: old WooCommerce product URLs → new Next.js routes
// Preserves SEO link equity built on grupolambea.com/producto/...
//
// NOTA PRODUCTOS DESCATALOGADOS (jun 2026): GELCOATLAM, ANTIDESLILAM y los discos
// están despublicados por decisión del cliente. Sus URLs antiguas (con SEO) NO deben
// apuntar a su slug de producto (devolvería 404), así que redirigen a su CATEGORÍA
// para conservar el link equity. Cada línea afectada lleva un comentario "DESCATALOGADO"
// con el slug original: si el producto se vuelve a publicar, devolver ahí el destination.
const wcRedirects = [
  { source: '/producto/gelcoatlam-fase-1-pasta-de-pulir-pulimento-de-fibra-de-vidrio-gelcoat-de-alto-corte-limpiador-blanqueador-para-fibra-de-vidrio-y-gelcoat-especial-caravaning-1-kg-copia', destination: '/tienda/caravaning', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/gelcoatlam-fase-2-caravaning'
  { source: '/producto/pasta-rosa-superbrillo-nautica-pulimento-para-metales-desbastar-a-maquina-formula-especial-nautica-liquida-pulir-metales', destination: '/tienda/pasta-rosa-superbrillo-nautico', permanent: true },
  { source: '/producto/inyeclam-diesel-aditivo-para-combustible-especial-pre-itv-limpiador-de-inyectores-y-sistema-de-alimentacion-diesel', destination: '/tienda/inyeclam-diesel-industrial', permanent: true },
  { source: '/producto/gelcoatlam-fase-1-pasta-de-pulir-pulimento-de-fibra-de-vidro-gelcoat-de-alto-corte-limpiador-blanqueador-para-fibra-de-vidrio-y-gelcoat-especial-nautico-1-kg', destination: '/tienda/nautico', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/gelcoatlam-fase-1-nautico'
  { source: '/producto/gelcoatlam-fase-2-pasta-de-pulir-pulimento-limpiador-blanqueador-de-fibra-de-vidrio-gelcoat-acabado-super-brillo-especial-nautica-1-kg', destination: '/tienda/nautico', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/gelcoatlam-fase-2-nautico'
  { source: '/producto/proteclam-nautico-limpiador-y-abrillantador-con-siliconas-para-superficies-lisas-y-satina-repelente-polvodas-1-litro', destination: '/tienda/proteclam-nautico', permanent: true },
  { source: '/producto/antideslizante-nautico-antideslizante-para-superficies-deslizantes-formula-especial-nautica-400-ml', destination: '/tienda/nautico', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/antideslilam-nautico'
  { source: '/producto/tekalam-nautico-protector-de-madera-formula-especial-nautica-1-litro-aceite-cubierta', destination: '/tienda/tekalam-nautico', permanent: true },
  { source: '/producto/pasta-pulir-liquida-verde-brillo-pulimento-para-metales-superbrillo-a-maquina-1-kg', destination: '/tienda/pasta-verde-superbrillo-industrial', permanent: true },
  { source: '/producto/pasta-rosa-superbrillo-pulimento-para-metales-desbastar-a-maquina-1-kg', destination: '/tienda/pasta-rosa-superbrillo-industrial', permanent: true },
  { source: '/producto/plastilam-pulimento-para-plasticos-1-kg-pasta-pulir-plasticos-faros', destination: '/tienda/plastilam-industrial', permanent: true },
  { source: '/producto/antideslilam-antideslizante-para-superficies-deslizantes-400-ml-barniz', destination: '/tienda/industrial', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/antideslilam-industrial'
  { source: '/producto/tekalam-protector-de-madera-1-litro', destination: '/tienda/tekalam-industrial', permanent: true },
  { source: '/producto/proteclam-limpiador-y-abrillantador-con-siliconas-para-superficies-lisas-y-satinadas-1-litro', destination: '/tienda/proteclam-industrial', permanent: true },
  { source: '/producto/motorlam-desengrasante-de-motores-de-alto-rendimiento-con-efecto-desodorante-1-litro-concentrado', destination: '/tienda/motorlam-industrial', permanent: true },
  { source: '/producto/pulimento-superbrillo-nautico-para-metales-a-mano-pule-limpia-abrillanta-elimina-velos-de-todo-tipo-de-metales-dejando-brillo-espejo-500-gr-pasta-barco', destination: '/tienda/pulimento-superbrillo-nautico', permanent: true },
  { source: '/producto/pasta-verde-superbrillo-nautica-pulimento-para-metales-superbrillo-a-maquina-formula-especial-nautica-1-kg-pulir', destination: '/tienda/pasta-verde-superbrillo-nautico', permanent: true },
  { source: '/producto/inyeclam-diesel-aditivo-para-combustible-limpiador-de-inyectores-y-sistema-de-alimentacion-diesel', destination: '/tienda/inyeclam-diesel-nautico', permanent: true },
  { source: '/producto/tapilam-nautico-limpiador-para-moquetas-y-tapicerias-formula-especial-nautica-1-litro-concentrado', destination: '/tienda/tapilam-nautico', permanent: true },
  { source: '/producto/manzalam-nautico-limpiador-y-reparador-multiusos-limpia-superficies-de-acero-inoxidable-satinado-y-elimina-restos-de-cal-y-oxido-1-litro-concentrado', destination: '/tienda/manzalam-nautico', permanent: true },
  { source: '/producto/motorlam-nautico-desengrasante-de-motores-de-alto-rendimiento-con-efecto-desodorante-formula-especial-nautica-1-litro-concentrado', destination: '/tienda/motorlam-nautico', permanent: true },
  { source: '/producto/desoxilam-nautico-desoxidante-energico-con-efecto-pasivante-no-efecta-a-plasticos-pintura-y-otras-instalaciones-1-litro-desincrustante-barco', destination: '/tienda/desoxilam-nautico', permanent: true },
  { source: '/producto/fosslam-nautico-limpiador-de-inodoros-quimicos-y-vater-wc-portatiles-4-en-1-1-litro-concentrado-especial-nautica-concentrado', destination: '/tienda/fosslam-nautico', permanent: true },
  { source: '/producto/tapilam-limpiador-para-moquetas-y-tapicerisa-1-litro-concentrado', destination: '/tienda/tapilam-industrial', permanent: true },
  { source: '/producto/manzalam-industriales-limpiador-y-reparador-multiusos-limpia-superficies-de-acero-inoxidable-satinado-y-elimina-restos-de-cal-y-oxido-1-litro-concentrado', destination: '/tienda/manzalam-industrial', permanent: true },
  { source: '/producto/decalam-decapante-gel-para-soldaduras-en-acero-inoxidables-1kg-concentrado', destination: '/tienda/decalam-industrial', permanent: true },
  { source: '/producto/fosslam-limpiador-de-inodoros-quimicos-y-vater-wc-portatiles-4-en-1-1-litro-concentrado', destination: '/tienda/fosslam-industrial', permanent: true },
  { source: '/producto/plastilam-caravaning-pulimento-para-plasticos-limpia-ventanillas-faros-demas-plasticos-1-kg-caravana-pasta-pulir-caravana', destination: '/tienda/plastilam-caravaning', permanent: true },
  { source: '/producto/pulimento-superbrillo-caravaning-para-metales-a-mano-pule-limpia-abrillanta-elimina-velos-de-todo-tipo-de-metales-dejando-brillo-espejo-500-gr-pasta-caravana', destination: '/tienda/pulimento-superbrillo-caravaning', permanent: true },
  { source: '/producto/antideslilam-caravaning-antideslizante-para-superficies-deslizantes-formula-especial-caravana-400-ml', destination: '/tienda/caravaning', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/antideslilam-caravaning'
  { source: '/producto/tekalam-caravaning-protector-de-madera-formula-especial-caravana-1-litro-resecamiento-humedad', destination: '/tienda/tekalam-caravaning', permanent: true },
  { source: '/producto/tapilam-caravaning-limpiador-para-moquetas-y-tapicerias-formula-especial-caravana-1-litro', destination: '/tienda/tapilam-caravaning', permanent: true },
  { source: '/producto/fosslam-caravaning-limpiador-de-inodoros-quimicos-y-vater-wc-portatiles-4-en-1-1-litro-concentrado', destination: '/tienda/fosslam-caravaning', permanent: true },
  { source: '/producto/fibralam-caravaning-limpiador-y-blanqueador-2-en-1-para-fibra-de-vidrio-y-gelcoat-1-litro-caravana', destination: '/tienda/fibralam-caravaning', permanent: true },
  { source: '/producto/limpiador-y-abrillantador-repelente-del-polvo', destination: '/tienda/proteclam-caravaning', permanent: true },
  { source: '/producto/manzalam-limpiador-y-reparador-multiusos-limpia-superficies-de-acero-inoxidable-satinado-y-elimina-restos-de-cal-y-oxido-1-litro-concentrado', destination: '/tienda/manzalam-caravaning', permanent: true },
  { source: '/producto/motorlam-caravaning-desengrasante-de-motores-de-alto-rendimiento-con-efecto-desodorante-formula-especial-caravaning-1-litro-caravana-concentrao', destination: '/tienda/motorlam-caravaning', permanent: true },
  { source: '/producto/desoxilam-caravaning-desoxidante-energico-con-efecto-pasivante-no-efecta-a-plasticos-pintura-y-otras-instalaciones-1-litro-desincrustante-caravana', destination: '/tienda/desoxilam-caravaning', permanent: true },
  { source: '/producto/gelcoatlam-fase-1-pasta-de-pulir-pulimento-de-fibra-de-vidro-gelcoat-de-alto-corte-limpiador-blanqueador-para-fibra-de-vidrio-y-gelcoat-especial-caravaning-1-kg', destination: '/tienda/caravaning', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/gelcoatlam-fase-1-caravaning'
  { source: '/producto/decalam-nautico-decapante-gel-para-soldaduras-en-acero-inoxidables-1-kg', destination: '/tienda/decalam-nautico', permanent: true },
  { source: '/producto/pasta-de-pulir-pulimento-superbrillo-para-metales-a-mano-pule-limpia-abrillanta-elimina-velos-de-todo-tipo-de-metales-dejando-brillo-espejo-500-gr', destination: '/tienda/pulimento-superbrillo-industrial', permanent: true },
  { source: '/producto/pasta-pulir-plastilam-nautico-pulimento-para-plasticos-limpia-cupulas-escotillas-parabrisas-y-demas-plasticos-1-kg', destination: '/tienda/plastilam-nautico', permanent: true },
  { source: '/producto/fibralam-nautico-limpiador-y-blanqueador-2-en-1-para-fibra-de-vidrio-y-gelcoat-especial-cascos-de-barcos-1-litro-barco', destination: '/tienda/fibralam-nautico', permanent: true },
  { source: '/producto/desoxilam-desoxidante-energico-con-efecto-pasivante-no-efecta-a-plasticos-pintura-y-otras-instalaciones-1-litro-desincrustante-concentrado', destination: '/tienda/desoxilam-industrial', permanent: true },
  { source: '/producto/disco-amarillo-de-tela-impregnado-paquete-de-diez-impregnacion-amarilla', destination: '/tienda/industrial', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/disco-algodon-amarilla'
  { source: '/producto/inyeclam-diesel-aditivo-para-combustible-especial-pre-itv-limpiador-de-inyectores-y-sistema-de-alimentacion-diesel-2', destination: '/tienda/inyeclam-diesel-caravaning', permanent: true },
  { source: '/producto/inyeclam-gasolina-aditivo-para-combustible-especial-pre-itv-limpiador-de-inyectores-y-sistema-de-alimentacion-gasolina', destination: '/tienda/inyeclam-gasolina-industrial', permanent: true },
  { source: '/producto/inyeclam-gasolina-aditivo-para-combustible-limpiador-de-inyectores-y-sistema-de-alimentacion-gasolina', destination: '/tienda/inyeclam-gasolina-nautico', permanent: true },
  { source: '/producto/disco-de-cuerda-paquete-de-diez-impregnacion-roja', destination: '/tienda/industrial', permanent: true }, // DESCATALOGADO → si se republica: '/tienda/disco-cuerda-roja'
  { source: '/producto/inyeclam-gasolina-aditivo-para-combustible-especial-pre-itv-limpiador-de-inyectores-y-sistema-de-alimentacion-gasolina-2', destination: '/tienda/inyeclam-gasolina-caravaning', permanent: true },
  // Discontinued products → redirect to store listing
  { source: '/producto/autolam-fase-2-pasta-para-pulir-todo-tipo-de-pinturas-y-barnices-caravaning', destination: '/tienda', permanent: true },
  { source: '/producto/autolam-fase-3-pasta-para-pulir-todo-tipo-de-pinturas-y-barnices', destination: '/tienda', permanent: true },
  { source: '/producto/autolam-fase-2-pasta-para-pulir-todo-tipo-de-pinturas-y-barnices', destination: '/tienda', permanent: true },
  { source: '/producto/autolam-fase-1-pasta-para-pulir-todo-tipo-de-pinturas-y-barnices', destination: '/tienda', permanent: true },
  { source: '/producto/autolam-fase-3-pasta-para-pulir-todo-tipo-de-pinturas-y-barnices-caravaning', destination: '/tienda', permanent: true },
  { source: '/producto/autolam-fase-1-pasta-para-pulir-todo-tipo-de-pinturas-y-barnices-caravaning', destination: '/tienda', permanent: true },
  { source: '/producto/disco-compacto-a2-para-soldaduras-de-150-x-3-x-6-x-12mm', destination: '/tienda', permanent: true },
  { source: '/producto/disco-compreser-con-soporte-arido-para-radial', destination: '/tienda', permanent: true },
  { source: '/producto/disco-de-franela-impregnacion-rosa', destination: '/tienda', permanent: true },
  { source: '/producto/disco-de-cuerda-triple-con-impregnacion-roja-para-pulidoras-planas', destination: '/tienda', permanent: true },
];

// 301 redirects: old WooCommerce content/category pages → new routes
const contentRedirects = [
  // ── Main content pages ──────────────────────────────────────────
  { source: '/tienda-lambea',                                         destination: '/tienda/nautico',    permanent: true },
  { source: '/productos-para-la-limpieza-de-barcos',                  destination: '/tienda/nautico',    permanent: true },
  { source: '/productos-de-limpieza-para-caravanas-y-furgonetas',     destination: '/tienda/caravaning', permanent: true },
  { source: '/productos-industriales',                                 destination: '/tienda/industrial', permanent: true },
  { source: '/discos-y-abrasivos',                                    destination: '/tienda/industrial', permanent: true },
  { source: '/sistema-anticaidas-para-hipica',                        destination: '/nosotros',          permanent: true },
  { source: '/experiencia',                                           destination: '/nosotros',          permanent: true },
  { source: '/politica-de-privacidad',                                destination: '/politica-privacidad', permanent: true },
  { source: '/politica-de-cookies',                                   destination: '/cookies',           permanent: true },
  { source: '/condiciones-de-contratacion',                           destination: '/condiciones-contratacion', permanent: true },

  // ── Blog posts → relevant product category ──────────────────────
  { source: '/limpieza-de-inyectores-diesel-guia-completa-para-optimizar-tu-vehiculo',         destination: '/tienda/inyeclam-diesel-industrial',   permanent: true },
  { source: '/aditivo-pre-itv-limpiador-de-inyectores-y-sistema-de-alimentacion-gasolina',    destination: '/tienda/inyeclam-gasolina-industrial',  permanent: true },

  // ── WooCommerce category pages → canonical category routes ──────
  { source: '/categoria-producto/productos-nauticos',                 destination: '/tienda/nautico',    permanent: true },
  { source: '/categoria-producto/productos-caravaning',               destination: '/tienda/caravaning', permanent: true },
  { source: '/categoria-producto/productos-industriales',             destination: '/tienda/industrial', permanent: true },
  { source: '/categoria-producto/discos-y-abrasivos',                 destination: '/tienda/industrial', permanent: true },
  { source: '/categoria-producto/mas-vendidos',                       destination: '/tienda/nautico',    permanent: true },
  // Subcategories — match by slug pattern
  { source: '/categoria-producto/:slug(.*(?:nautico|nauticos|nautica|barco|barcos).*)', destination: '/tienda/nautico',    permanent: true },
  { source: '/categoria-producto/:slug(.*caravaning.*)',              destination: '/tienda/caravaning', permanent: true },
  { source: '/categoria-producto/:slug(.*industrial.*)',              destination: '/tienda/industrial', permanent: true },
  // Fallback: any remaining category → main store
  { source: '/categoria-producto/:slug*',                             destination: '/tienda/nautico',    permanent: true },

  // ── WooCommerce tag pages (89 URLs) → category fallback ─────────
  { source: '/etiqueta-producto/:slug*',                              destination: '/tienda/nautico',    permanent: true },
] as const;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "grupolambea.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      ...wcRedirects,
      ...contentRedirects,
      // Category ?cat= query params → canonical path-based URLs
      { source: '/tienda', has: [{ type: 'query', key: 'cat', value: 'nautico' }],    destination: '/tienda/nautico',    permanent: true },
      { source: '/tienda', has: [{ type: 'query', key: 'cat', value: 'caravaning' }], destination: '/tienda/caravaning', permanent: true },
      { source: '/tienda', has: [{ type: 'query', key: 'cat', value: 'industrial' }], destination: '/tienda/industrial', permanent: true },
    ];
  },
};

export default nextConfig;
