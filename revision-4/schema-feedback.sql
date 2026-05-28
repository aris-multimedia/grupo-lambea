-- Tabla para feedback del cliente sobre imágenes antes/después.
-- Una fila por slug. Última opinión gana (revisor anónimo).
-- Para limpiar al terminar la revisión: DROP TABLE image_feedback;

CREATE TABLE IF NOT EXISTS image_feedback (
  slug TEXT PRIMARY KEY,
  estado TEXT CHECK (estado IN ('aprobado', 'mejorar', 'rehacer')),
  comentario TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_feedback_estado ON image_feedback(estado);
CREATE INDEX IF NOT EXISTS idx_image_feedback_updated ON image_feedback(updated_at DESC);
