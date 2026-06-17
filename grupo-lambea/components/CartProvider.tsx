'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import type { CartItem, CartState } from '@/types/product';
import type { ActivePromo } from '@/lib/settings-schema';

const DEFAULT_PROMO: ActivePromo = {
  activa: false,
  tipo: '3x2',
  titulo: '',
  descripcion: '',
  valor: 0,
};

type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'cantidad'> }
  | { type: 'REMOVE'; slug: string; aplicacion: string; formato: string }
  | { type: 'UPDATE_QTY'; slug: string; aplicacion: string; formato: string; delta: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] };

function cartKey(slug: string, aplicacion: string, formato: string) {
  return `${slug}|${aplicacion}|${formato}`;
}

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'LOAD':
      return action.items;
    case 'ADD': {
      const key = cartKey(action.item.slug, action.item.aplicacion, action.item.formato);
      const existing = state.find(
        (i) => cartKey(i.slug, i.aplicacion, i.formato) === key
      );
      if (existing) {
        return state.map((i) =>
          cartKey(i.slug, i.aplicacion, i.formato) === key
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...state, { ...action.item, cantidad: 1 }];
    }
    case 'REMOVE':
      return state.filter(
        (i) =>
          cartKey(i.slug, i.aplicacion, i.formato) !==
          cartKey(action.slug, action.aplicacion, action.formato)
      );
    case 'UPDATE_QTY': {
      const key = cartKey(action.slug, action.aplicacion, action.formato);
      return state
        .map((i) =>
          cartKey(i.slug, i.aplicacion, i.formato) === key
            ? { ...i, cantidad: Math.max(0, i.cantidad + action.delta) }
            : i
        )
        .filter((i) => i.cantidad > 0);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

const CartContext = createContext<CartState>({
  items: [],
  promo: DEFAULT_PROMO,
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
});

export function CartProvider({
  children,
  promo = DEFAULT_PROMO,
}: {
  children: React.ReactNode;
  promo?: ActivePromo;
}) {
  const [items, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lambea-cart');
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) });
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lambea-cart', JSON.stringify(items));
  }, [items]);

  const value: CartState = {
    items,
    promo,
    addItem: (item) => dispatch({ type: 'ADD', item }),
    removeItem: (slug, aplicacion, formato) =>
      dispatch({ type: 'REMOVE', slug, aplicacion, formato }),
    updateQty: (slug, aplicacion, formato, delta) =>
      dispatch({ type: 'UPDATE_QTY', slug, aplicacion, formato, delta }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
