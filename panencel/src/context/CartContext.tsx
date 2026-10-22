import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PRODUCTS } from '../data/mockData';
import { Product } from '../types';

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartContextValue {
  cart: Record<string, number>; // id de producto -> cantidad
  lines: CartLine[]; // solo productos con cantidad > 0
  total: number;
  count: number;
  add: (p: Product) => void;
  remove: (p: Product) => void; // resta 1 unidad
  // CAMBIO (carrito): quita el producto completo sin importar su cantidad.
  // Lo usa el botón "Quitar" de CartScreen.
  removeLine: (p: Product) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});

  const add = useCallback(
    (p: Product) => setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 })),
    [],
  );

  const remove = useCallback((p: Product) => {
    setCart((prev) => {
      const q = (prev[p.id] ?? 0) - 1;
      const next = { ...prev };
      if (q <= 0) delete next[p.id];
      else next[p.id] = q;
      return next;
    });
  }, []);

  const removeLine = useCallback((p: Product) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[p.id];
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = [];
    let total = 0;
    let count = 0;
    for (const product of PRODUCTS) {
      const qty = cart[product.id] ?? 0;
      if (qty > 0) {
        lines.push({ product, qty });
        total += qty * product.price;
        count += qty;
      }
    }
    return { cart, lines, total, count, add, remove, removeLine, clear };
  }, [cart, add, remove, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
