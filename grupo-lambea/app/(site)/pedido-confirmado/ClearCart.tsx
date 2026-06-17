'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/CartProvider'

/** Vacía la cesta al llegar a la confirmación (solo se llega aquí tras pagar). */
export function ClearCart() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
