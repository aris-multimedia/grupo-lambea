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

-- ── PRODUCT IMAGES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  orden      INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  numero_pedido     TEXT UNIQUE NOT NULL,
  estado            TEXT NOT NULL DEFAULT 'nuevo',  -- nuevo | confirmado | enviado | cancelado
  cliente_nombre    TEXT NOT NULL,
  cliente_email     TEXT NOT NULL,
  cliente_telefono  TEXT,
  cliente_direccion TEXT,
  cliente_ciudad    TEXT,
  cliente_cp        TEXT,
  total             DECIMAL(10,2) NOT NULL,
  notas             TEXT,
  genei_shipment_id TEXT,
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
