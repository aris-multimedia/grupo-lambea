-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                 SERIAL PRIMARY KEY,
  slug               TEXT UNIQUE NOT NULL,
  familia            TEXT NOT NULL,
  nombre             TEXT NOT NULL,
  descripcion_corta  TEXT,
  descripcion_larga  TEXT,
  aplicaciones       TEXT[]  NOT NULL DEFAULT '{}',
  precio_desde       DECIMAL(10,2),
  precio_hasta       DECIMAL(10,2),
  formatos           TEXT[],
  valoracion         DECIMAL(3,1),
  num_valoraciones   INTEGER,
  codigo_toxicologia TEXT,
  instrucciones_uso  TEXT,
  usos               TEXT[],
  caracteristicas    TEXT[],
  imagen             TEXT,
  bestseller         BOOLEAN NOT NULL DEFAULT false,
  publicado          BOOLEAN NOT NULL DEFAULT true,
  visible_admin      BOOLEAN NOT NULL DEFAULT true,
  promo_3x2          BOOLEAN NOT NULL DEFAULT true,
  wc_id              INTEGER,
  seo_title          TEXT,   -- título SEO (Yoast, web antigua) — preserva keywords posicionadas
  seo_description    TEXT,   -- meta description SEO (Yoast)
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PRODUCT DOCUMENTS (fichas técnicas, hojas de seguridad) ──────────────────
CREATE TABLE IF NOT EXISTS product_documents (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tipo           TEXT NOT NULL,   -- 'ficha_tecnica' | 'hoja_seguridad'
  idioma         TEXT NOT NULL DEFAULT 'es',
  url            TEXT NOT NULL,
  nombre_archivo TEXT
);
-- Necesario para el upsert ON CONFLICT (product_id, tipo, idioma) de updateProduct
CREATE UNIQUE INDEX IF NOT EXISTS product_documents_unique
  ON product_documents (product_id, tipo, idioma);

-- ── PRODUCT IMAGES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  orden      INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- ── PRODUCT REVIEWS (reseñas reales migradas de WooCommerce) ─────────────────
CREATE TABLE IF NOT EXISTS product_reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  texto       TEXT,
  fecha_texto TEXT,
  fecha_iso   DATE,
  fuente      TEXT NOT NULL DEFAULT 'woocommerce',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  numero_pedido     TEXT UNIQUE NOT NULL,
  estado            TEXT NOT NULL DEFAULT 'nuevo',  -- nuevo | confirmado | enviado | entregado | completado | cancelado | reembolsado
  cliente_nombre    TEXT NOT NULL,
  cliente_email     TEXT NOT NULL,
  cliente_telefono  TEXT,
  cliente_direccion TEXT,
  cliente_ciudad    TEXT,
  cliente_cp        TEXT,
  total             DECIMAL(10,2) NOT NULL,
  notas             TEXT,
  tipo_cliente        TEXT NOT NULL DEFAULT 'particular',  -- particular | empresa
  facturacion_empresa TEXT,
  facturacion_nif     TEXT,
  facturacion_dir     TEXT,
  facturacion_ciudad  TEXT,
  facturacion_cp      TEXT,
  -- Facturación (preparado para Verifactu). La factura NO se emite al pagar:
  -- factura_estado pasa a 'emitida' solo cuando el pedido está 'completado'
  -- (entregado y aceptado). Ver lib/invoicing.ts.
  factura_solicitada  BOOLEAN NOT NULL DEFAULT false,  -- empresa o particular que pidió factura
  factura_estado      TEXT NOT NULL DEFAULT 'no',       -- no | pendiente | emitida | error
  factura_numero      TEXT,                             -- número legal de la factura (Verifactu)
  factura_url         TEXT,                             -- PDF de la factura
  factura_emitida_at  TIMESTAMPTZ,
  enviado_at          TIMESTAMPTZ,
  entregado_at        TIMESTAMPTZ,
  stripe_payment_intent TEXT,             -- enlaza reembolsos de Stripe con el pedido
  stock_restaurado    BOOLEAN NOT NULL DEFAULT false, -- garantiza restauración de stock única al cancelar/reembolsar
  genei_shipment_id TEXT,
  tracking_url      TEXT,                 -- enlace de seguimiento (lo rellenará GENEI); va en el email de "enviado"
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ORDER ITEMS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       INTEGER REFERENCES products(id),
  cantidad         INTEGER NOT NULL,
  precio_unitario  DECIMAL(10,2) NOT NULL,
  nombre_producto  TEXT NOT NULL,
  formato          TEXT
);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── NEWSLETTER (suscriptores con consentimiento RGPD) ─────────────────────────
-- Se alimenta desde el formulario del footer y desde el checkbox opcional del
-- checkout. De aquí se exportan/sincronizan los contactos a la herramienta de
-- email marketing que se elija (Resend Audiences, Brevo, Mailchimp…).
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  consent     BOOLEAN NOT NULL DEFAULT true,  -- solo se inserta con consentimiento explícito
  source      TEXT,                            -- 'footer' | 'checkout' | ...
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PENDING CHECKOUTS (pago con Stripe) ──────────────────────────────────────
-- Guarda los datos validados del pedido ANTES de pagar. El pedido real (tabla
-- orders) NO se crea hasta que Stripe confirma el pago; entonces se convierte
-- este registro en pedido (idempotente vía order_id + orders.numero_pedido UNIQUE).
CREATE TABLE IF NOT EXISTS pending_checkouts (
  id          TEXT PRIMARY KEY,                -- = numero_pedido reservado
  session_id  TEXT,                            -- id de la Stripe Checkout Session
  payload     JSONB NOT NULL,                  -- cliente + items + total validados
  order_id    INTEGER,                         -- se rellena al convertir en pedido
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
