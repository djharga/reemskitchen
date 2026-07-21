"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "reems-kitchen-cart-v1";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  orderNote: string;
  setOrderNote: (note: string) => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalCents: number;
  hasUnpricedItems: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

const sameLine = (a: CartItem, productId: string, variantId: string | null) =>
  a.productId === productId && a.variantId === variantId;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage (client only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (typeof parsed.orderNote === "string")
          setOrderNote(parsed.orderNote);
      }
    } catch {
      // corrupted storage — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items, orderNote }),
    );
  }, [items, orderNote, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      // Optimistic update — the drawer opens immediately
      setItems((prev) => {
        const existing = prev.find((i) =>
          sameLine(i, item.productId, item.variantId),
        );
        if (existing) {
          return prev.map((i) =>
            sameLine(i, item.productId, item.variantId)
              ? { ...i, quantity: Math.min(i.quantity + quantity, 50) }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !sameLine(i, productId, variantId))
          : prev.map((i) =>
              sameLine(i, productId, variantId)
                ? { ...i, quantity: Math.min(quantity, 50) }
                : i,
            ),
      );
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | null) => {
      setItems((prev) =>
        prev.filter((i) => !sameLine(i, productId, variantId)),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setOrderNote("");
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + (i.priceCents ?? 0) * i.quantity,
      0,
    );
    const hasUnpricedItems = items.some((i) => i.priceCents === null);
    return {
      items,
      isOpen,
      orderNote,
      setOrderNote,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount,
      subtotalCents,
      hasUnpricedItems,
    };
  }, [
    items,
    isOpen,
    orderNote,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
