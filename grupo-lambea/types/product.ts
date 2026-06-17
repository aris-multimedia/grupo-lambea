export type Aplicacion = 'nautico' | 'caravaning' | 'industrial';

export interface FamiliaProducto {
  familia: string;
  descripcion_corta: string;
  descripcion_larga?: string;
  usos?: string[];
  aplicaciones: Aplicacion[];
  formatos?: string[];
  precio_desde: number;
  precio_hasta?: number;
  valoracion?: number | null;
  num_valoraciones?: number;
  codigo_toxicologia?: string;
  caracteristicas?: string[];
  instrucciones_uso?: string;
  urls: {
    nautico?: string;
    caravaning?: string;
    generico?: string;
  };
  // Derived fields added by lib/products.ts
  slug?: string;
  imagen?: string;
}

export interface CartItem {
  slug: string;
  familia: string;
  aplicacion: string;
  formato: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

import type { ActivePromo } from '@/lib/settings-schema';

export interface CartState {
  items: CartItem[];
  promo: ActivePromo;
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  removeItem: (slug: string, aplicacion: string, formato: string) => void;
  updateQty: (slug: string, aplicacion: string, formato: string, delta: number) => void;
  clearCart: () => void;
}
