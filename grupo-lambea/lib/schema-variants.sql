-- ── PRODUCT VARIANTS (images + real prices per format) ──────────────────────
-- Generated from WooCommerce API, May 2026

CREATE TABLE IF NOT EXISTS product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  formato     TEXT NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  imagen_url  TEXT,
  orden       INTEGER NOT NULL DEFAULT 0,
  -- Stock por formato. Se descuenta al confirmarse el pago (lib/stock.ts) y se
  -- restaura si el pedido se cancela/reembolsa. Anti-sobreventa en checkout.
  stock       INT NOT NULL DEFAULT 10,
  -- Peso del paquete en gramos, para la etiqueta de envío (GENEI). Hoy contiene
  -- una ESTIMACIÓN derivada del formato (ml/g 1:1, L/kg ×1000, +8% +60 g);
  -- sustituir por los pesos reales cuando los dé el cliente.
  peso_gramos INT,
  UNIQUE(product_id, formato)
);

-- Populate variants (uses slug to find product_id)
-- gelcoatlam-fase-2-caravaning (WC_ID 21617)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'gelcoatlam-fase-2-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 30.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133828.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pasta-rosa-superbrillo-nautico (WC_ID 15840)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pasta-rosa-superbrillo-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1.3 Kg', 16.90, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210906_001-1.jpeg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 10.15, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210906_001-1.jpeg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- inyeclam-diesel-industrial (WC_ID 15766)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'inyeclam-diesel-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 52.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-DIESEL-INDUSTRIAL-250-ML.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.25 Litros / 250 ml', 18.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-DIESEL-INDUSTRIAL-250-ML.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- gelcoatlam-fase-1-nautico (WC_ID 15764)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'gelcoatlam-fase-1-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 30.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210314.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- gelcoatlam-fase-2-nautico (WC_ID 15763)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'gelcoatlam-fase-2-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, 'Variante 1', 30.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210332-1.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- proteclam-nautico (WC_ID 15762)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'proteclam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 31.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Litros / 500 ml', 14.70, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 569.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211457.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 113.50, 'https://grupolambea.com/wp-content/uploads/2021/09/IMG_20190909_192417-2-2.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- antideslilam-nautico (WC_ID 15761)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'antideslilam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.4 Litros / 400 ml', 22.50, 'https://grupolambea.com/wp-content/uploads/2021/09/31TV17qh64L.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- tekalam-nautico (WC_ID 15757)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'tekalam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 354.90, 'https://grupolambea.com/wp-content/uploads/2021/09/TEKALAM-NAUTIC-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 79.90, 'https://grupolambea.com/wp-content/uploads/2021/09/TEKALAM-NAUTIC-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 16.80, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210739-2.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pasta-verde-superbrillo-industrial (WC_ID 15753)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pasta-verde-superbrillo-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1KG', 18.90, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210832.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0,5KG', 11.30, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210832.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pasta-rosa-superbrillo-industrial (WC_ID 15752)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pasta-rosa-superbrillo-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1KG', 16.90, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210906_001.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0,5KG', 10.15, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210906_001.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- plastilam-industrial (WC_ID 15751)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'plastilam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250g', 10.50, 'https://grupolambea.com/wp-content/uploads/2021/09/4.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 31.50, 'https://grupolambea.com/wp-content/uploads/2023/07/PLASTILAM-INDUSTRIAL-500-g-scaled.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 17.80, 'https://grupolambea.com/wp-content/uploads/2021/09/5.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- antideslilam-industrial (WC_ID 15747)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'antideslilam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.4 Litros / 400 ml', 22.50, 'https://grupolambea.com/wp-content/uploads/2021/09/31TV17qh64L.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- tekalam-industrial (WC_ID 15743)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'tekalam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 354.90, 'https://grupolambea.com/wp-content/uploads/2021/09/TEKALAM-25L-INDUSTRIAL-ult-1.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 70.50, 'https://grupolambea.com/wp-content/uploads/2021/09/TEKALAM-5L-INDUSTRIAL-ult-1.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 16.80, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133422.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- proteclam-industrial (WC_ID 15742)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'proteclam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 31.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Litros / 500 ml', 14.70, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 569.70, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 113.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- motorlam-industrial (WC_ID 15738)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'motorlam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 385.68, 'https://grupolambea.com/wp-content/uploads/2021/09/MOTORLAM-INDUSTRIAL-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 81.67, 'https://grupolambea.com/wp-content/uploads/2021/09/MOTORLAM-INDUSTRIAL-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 18.15, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210221-1.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pulimento-superbrillo-nautico (WC_ID 15681)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pulimento-superbrillo-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '100g', 7.90, 'https://grupolambea.com/wp-content/uploads/2023/07/PULIMENTO-SUPERBRILLO-NAUTICO-125g-scaled.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250g', 14.00, 'https://grupolambea.com/wp-content/uploads/2021/09/8.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 42.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211514_001.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 24.00, 'https://grupolambea.com/wp-content/uploads/2021/09/9.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pasta-verde-superbrillo-nautico (WC_ID 15679)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pasta-verde-superbrillo-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1,3KG', 18.90, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210832.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0,5KG', 11.30, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210832.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- inyeclam-diesel-nautico (WC_ID 15677)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'inyeclam-diesel-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 52.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-DIESEL-NAUTICO-250-ML.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.25 Litros / 250 ml', 18.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-DIESEL-NAUTICO-250-ML.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- tapilam-nautico (WC_ID 15674)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'tapilam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 380.37, 'https://grupolambea.com/wp-content/uploads/2021/09/TAPILAM-NAUTICO-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 80.55, 'https://grupolambea.com/wp-content/uploads/2021/09/TAPILAM-NAUTICO-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 17.90, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211228-2.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- manzalam-nautico (WC_ID 15673)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'manzalam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 382.00, 'https://grupolambea.com/wp-content/uploads/2021/09/MANZALAM-NAUTICO-25L-LAST-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 81.00, 'https://grupolambea.com/wp-content/uploads/2021/09/MANZALAM-NAUTICO-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 18.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211106-1.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- motorlam-nautico (WC_ID 15672)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'motorlam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 385.68, 'https://grupolambea.com/wp-content/uploads/2021/09/MOTORLAM-NAUTICO-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 81.67, 'https://grupolambea.com/wp-content/uploads/2021/09/MOTORLAM-NAUTICO-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 18.15, 'https://grupolambea.com/wp-content/uploads/2024/03/MOTORLAN-N.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- desoxilam-nautico (WC_ID 15670)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'desoxilam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 391.00, 'https://grupolambea.com/wp-content/uploads/2021/09/DESOXIDANTE-NAUTICO-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 82.00, 'https://grupolambea.com/wp-content/uploads/2021/09/DESOXIDANTE-NAUTICO-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 19.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211016.webp', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Litros / 500 ml', 15.00, 'https://grupolambea.com/wp-content/uploads/2021/09/desoxilam-nautico-500.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.25 Litros / 250 ml', 11.00, 'https://grupolambea.com/wp-content/uploads/2021/09/desoxilam-nautico-250.jpg', 5)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.125 Litros / 125 ml', 7.50, 'https://grupolambea.com/wp-content/uploads/2021/09/desoxilam-nautico-125.jpg', 6)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- fosslam-nautico (WC_ID 15669)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'fosslam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 29.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211315.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 137.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FOSSLAM-NAUTICO-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 688.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FOSSLAM-NAUTICO-25L-LAST-2.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- tapilam-industrial (WC_ID 15668)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'tapilam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 380.37, 'https://grupolambea.com/wp-content/uploads/2021/09/TAPILAM-INDUSTRIAL-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 80.55, 'https://grupolambea.com/wp-content/uploads/2021/09/TAPILAM-INDUSTRIAL-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 17.90, 'https://grupolambea.com/wp-content/uploads/2021/09/31IoqSpL-e1689784663905.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- manzalam-industrial (WC_ID 15667)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'manzalam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 382.00, 'https://grupolambea.com/wp-content/uploads/2021/09/MANZALAM-INDUSTRIAL-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 81.00, 'https://grupolambea.com/wp-content/uploads/2021/09/MANZALAM-INDUSTRIAL-5L-ult-2.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 18.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210205.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- decalam-industrial (WC_ID 15665)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'decalam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, 'Variante 1', 33.40, 'https://grupolambea.com/wp-content/uploads/2021/09/71vIas0I7NL._AC_SL1500_-1-e1689265796364.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- fosslam-industrial (WC_ID 15664)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'fosslam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 688.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FOSLAM-25L-Industrial-ult.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5Litros', 137.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FOSLAM-5L-Industrial-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 29.00, 'https://grupolambea.com/wp-content/uploads/2021/09/71QnNy4dufL._AC_SL1500_.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- plastilam-caravaning (WC_ID 15658)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'plastilam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250g', 10.50, 'https://grupolambea.com/wp-content/uploads/2023/07/PLASTILAM-INDUSTRIAL-250-g-scaled.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 31.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133608.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 17.80, 'https://grupolambea.com/wp-content/uploads/2023/07/PLASTILAM-INDUSTRIAL-500-g-scaled.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pulimento-superbrillo-caravaning (WC_ID 15657)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pulimento-superbrillo-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250g', 14.00, 'https://grupolambea.com/wp-content/uploads/2021/09/Diseno-sin-titulo.png', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '100g', 7.90, 'https://grupolambea.com/wp-content/uploads/2023/07/PULIMENTO-SUPERBRILLO-CARAVANING-125g-scaled.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 24.00, 'https://grupolambea.com/wp-content/uploads/2021/09/Diseno-sin-titulo-14.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 42.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133629.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- antideslilam-caravaning (WC_ID 15656)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'antideslilam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.4 Litros / 400 ml', 20.50, 'https://grupolambea.com/wp-content/uploads/2021/09/31TV17qh64L.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- tekalam-caravaning (WC_ID 15655)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'tekalam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 308.95, 'https://grupolambea.com/wp-content/uploads/2021/09/TEKALAM-CARAVANING-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 59.95, 'https://grupolambea.com/wp-content/uploads/2021/09/TEKALAM-CARAVANING-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 16.80, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133422.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- tapilam-caravaning (WC_ID 15654)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'tapilam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 380.37, 'https://grupolambea.com/wp-content/uploads/2021/09/TAPILAM-CARAVANING-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 80.55, 'https://grupolambea.com/wp-content/uploads/2021/09/TAPILAM-CARAVANING-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 17.90, 'https://grupolambea.com/wp-content/uploads/2023/07/tapilam-caravaning.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- fosslam-caravaning (WC_ID 15653)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'fosslam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 688.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FOSSLAM-CARAVANIG-25L-ult.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 137.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FOSSLAM-CARAVANIG-5L-ult-1.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 29.00, 'https://grupolambea.com/wp-content/uploads/2021/09/71av2HsCN7L._AC_SL1500_-1.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- fibralam-caravaning (WC_ID 15652)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'fibralam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 371.87, 'https://grupolambea.com/wp-content/uploads/2021/09/FIBRALAM-25L-CARAVANING-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 78.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FIBRALAM-5L-CARAVANING-LAST.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 17.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133555.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- proteclam-caravaning (WC_ID 15651)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'proteclam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 569.95, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133943_001.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 109.95, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133943_001.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 31.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Litros / 500 ml', 14.70, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210132.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- manzalam-caravaning (WC_ID 15650)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'manzalam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 382.00, 'https://grupolambea.com/wp-content/uploads/2021/09/MANZALAM-25L-CARAVANING-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 81.00, 'https://grupolambea.com/wp-content/uploads/2021/09/MANZALAM-CARAVANING-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 18.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133531.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- motorlam-caravaning (WC_ID 15649)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'motorlam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 385.68, 'https://grupolambea.com/wp-content/uploads/2021/09/MOTORLAM-CARAVANING-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 81.67, 'https://grupolambea.com/wp-content/uploads/2021/09/MOTORLAM-CARAVANING-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 18.15, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133500.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- desoxilam-caravaning (WC_ID 15648)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'desoxilam-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25L', 391.00, 'https://grupolambea.com/wp-content/uploads/2021/09/DESOXIDANTE-CARAVANING-25-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5L', 82.00, 'https://grupolambea.com/wp-content/uploads/2021/09/DESOXIDANTE-CARAVANING-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1L', 19.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133259.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '500ML', 15.00, 'https://grupolambea.com/wp-content/uploads/2021/09/Desoxilam-caravaning-500ml-v2.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250ML', 11.00, 'https://grupolambea.com/wp-content/uploads/2021/09/Desoxilam-caravaning-250ml-v3.jpg', 5)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '125ML', 7.50, 'https://grupolambea.com/wp-content/uploads/2021/09/Desoxilam-caravaning-125ml-v2.jpg', 6)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- gelcoatlam-fase-1-caravaning (WC_ID 15659)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'gelcoatlam-fase-1-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 30.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_133828.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- decalam-nautico (WC_ID 15675)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'decalam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 33.40, 'https://grupolambea.com/wp-content/uploads/2021/09/WhatsApp-Image-2018-07-27-at-17.54.36-1-2-e1689265918205.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- pulimento-superbrillo-industrial (WC_ID 15748)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'pulimento-superbrillo-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250g', 14.00, 'https://grupolambea.com/wp-content/uploads/2021/09/Diseno-sin-titulo-16.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '100g', 7.90, 'https://grupolambea.com/wp-content/uploads/2023/07/PULIMENTO-SUPERBRILLO-INDUSTRIAL-125g-scaled.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 42.00, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_210410-1.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 24.00, 'https://grupolambea.com/wp-content/uploads/2023/07/PULIMENTO-SUPERBRILLO-INDUSTRIAL-500g-scaled.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- plastilam-nautico (WC_ID 15680)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'plastilam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250g', 10.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211531.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 kg', 31.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211531.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.5 Kg', 17.80, 'https://grupolambea.com/wp-content/uploads/2021/09/7.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- fibralam-nautico (WC_ID 15676)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'fibralam-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25 Litros', 371.87, 'https://grupolambea.com/wp-content/uploads/2021/09/FIBRALAM-NAUTICO-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5 Litros', 78.75, 'https://grupolambea.com/wp-content/uploads/2021/09/FIBRALAM-NAUTICO-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 17.50, 'https://grupolambea.com/wp-content/uploads/2021/09/20200202_211157.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- desoxilam-industrial (WC_ID 15666)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'desoxilam-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '25L', 391.00, 'https://grupolambea.com/wp-content/uploads/2021/09/DESOXIDANTE-INDUSTRIAL-25L-ult.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5L', 82.00, 'https://grupolambea.com/wp-content/uploads/2021/09/DESOXIDANTE-INDUSTRIAL-5L-ult.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1L', 19.50, 'https://grupolambea.com/wp-content/uploads/2021/09/71X25RzfZuL._AC_SL1500_-e1689784561850.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '500ML', 15.00, 'https://grupolambea.com/wp-content/uploads/2022/11/DESOXILAM-INDUSTRIAL-500-ML.jpg', 4)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250ML', 11.00, 'https://grupolambea.com/wp-content/uploads/2021/09/Desoxilam-industrial-250ml.jpg', 5)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '125ML', 7.50, 'https://grupolambea.com/wp-content/uploads/2021/09/Desoxilam-industrial-125ml.jpg', 6)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- disco-algodon-amarilla (WC_ID 15773)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'disco-algodon-amarilla';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '10', 82.76, 'https://grupolambea.com/wp-content/uploads/2021/09/1626367257606-1-scaled-1.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5', 46.56, 'https://grupolambea.com/wp-content/uploads/2021/09/1626367257606-1-scaled-1.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1', 10.35, 'https://grupolambea.com/wp-content/uploads/2021/09/1626367257606-1-scaled-1.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- inyeclam-diesel-caravaning (WC_ID 15768)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'inyeclam-diesel-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 52.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-DIESEL-250-ML-1.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.25 Litros / 250 ml', 18.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-DIESEL-250-ML-1.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- inyeclam-gasolina-industrial (WC_ID 15765)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'inyeclam-gasolina-industrial';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '250ml', 18.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-GASOLINA-INDUSTRIAL-250-ML.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 L', 52.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-GASOLINA-INDUSTRIAL-250-ML.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- inyeclam-gasolina-nautico (WC_ID 15792)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'inyeclam-gasolina-nautico';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 52.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-GASOLINA-NAUTICO-250-ML.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.25 Litros / 250 ml', 18.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-GASOLINA-NAUTICO-250-ML.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- disco-cuerda-roja (WC_ID 15772)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'disco-cuerda-roja';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '10', 81.02, 'https://grupolambea.com/wp-content/uploads/2021/09/IMG_20210715_184745-scaled-1.jpg', 0)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '5', 45.58, 'https://grupolambea.com/wp-content/uploads/2021/09/IMG_20210715_184745-scaled-1.jpg', 1)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1', 10.13, 'https://grupolambea.com/wp-content/uploads/2021/09/IMG_20210715_184745-scaled-1.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- inyeclam-gasolina-caravaning (WC_ID 15767)
DO $$ DECLARE pid INTEGER; BEGIN
  SELECT id INTO pid FROM products WHERE slug = 'inyeclam-gasolina-caravaning';
  IF pid IS NOT NULL THEN
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '1 Litro', 52.00, 'https://grupolambea.com/wp-content/uploads/2023/07/INYECLAM-GASOLINA-250-ML-1.jpg', 2)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
    INSERT INTO product_variants (product_id, formato, precio, imagen_url, orden)
    VALUES (pid, '0.25 Litros / 250 ml', 18.00, 'https://grupolambea.com/wp-content/uploads/2024/03/INYECLAM-GASOLINA-250-ML-1.jpg', 3)
    ON CONFLICT (product_id, formato) DO UPDATE SET precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;
  END IF;
END $$;

-- Variant rows for 50 products (12 WC products skipped - discontinued).
-- Los packs "3X2 en ..." del WooCommerce antiguo se eliminaron del seed: la promo
-- 3×2 ahora es automática (lib/cart.ts + cupón Stripe) y re-sembrarlos causaría
-- doble descuento.