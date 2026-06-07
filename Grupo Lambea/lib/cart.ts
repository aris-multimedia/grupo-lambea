import type { CartItem } from '@/types/product';

/** Returns total units for a given familia slug across all items */
export function unitsForFamilia(items: CartItem[], slug: string): number {
  return items
    .filter((i) => i.slug === slug)
    .reduce((sum, i) => sum + i.cantidad, 0);
}

/** How many free units does this familia earn under 3x2? (floor(n/3)) */
export function freeUnitsFor(items: CartItem[], slug: string): number {
  return Math.floor(unitsForFamilia(items, slug) / 3);
}

/**
 * Total discount for a single familia.
 * We give away the cheapest unit(s) for free.
 */
export function discountForFamilia(items: CartItem[], slug: string): number {
  const familiaItems = items.filter((i) => i.slug === slug);
  const freeCount = freeUnitsFor(items, slug);
  if (freeCount === 0) return 0;

  // Flatten units sorted cheapest first
  const units: number[] = [];
  for (const item of familiaItems) {
    for (let i = 0; i < item.cantidad; i++) {
      units.push(item.precio);
    }
  }
  units.sort((a, b) => a - b);
  return units.slice(0, freeCount).reduce((s, p) => s + p, 0);
}

export function subtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.precio * i.cantidad, 0);
}

export function totalDiscount(items: CartItem[]): number {
  const slugs = [...new Set(items.map((i) => i.slug))];
  return slugs.reduce((s, slug) => s + discountForFamilia(items, slug), 0);
}

export function total(items: CartItem[]): number {
  return subtotal(items) - totalDiscount(items);
}
