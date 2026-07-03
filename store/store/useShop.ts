import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

type CartItem = {
  product: Product;
  qty: number;
  size: string;
  color: string;
};

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  coupon?: { code: string; off: number };
  addToCart: (p: Product, size: string, color: string, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  applyCoupon: (code: string) => boolean;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      addToCart: (product, size, color, qty = 1) => {
        const existing = get().cart.find(
          (i) => i.product.id === product.id && i.size === size && i.color === color,
        );
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i === existing ? { ...i, qty: i.qty + qty } : i,
            ),
          });
        } else {
          set({ cart: [...get().cart, { product, size, color, qty }] });
        }
      },
      updateQty: (id, qty) =>
        set({
          cart: get()
            .cart.map((i) => (i.product.id === id ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        }),
      removeFromCart: (id) =>
        set({ cart: get().cart.filter((i) => i.product.id !== id) }),
      clearCart: () => set({ cart: [], coupon: undefined }),
      toggleWishlist: (id) => {
        const w = get().wishlist;
        set({ wishlist: w.includes(id) ? w.filter((x) => x !== id) : [...w, id] });
      },
      applyCoupon: (code) => {
        const c = code.trim().toUpperCase();
        const map: Record<string, number> = { STYLE10: 10, HUB20: 20, WELCOME: 15 };
        if (map[c]) {
          set({ coupon: { code: c, off: map[c] } });
          return true;
        }
        return false;
      },
    }),
    { name: "stylofy-shop" },
  ),
);

export const cartTotals = (cart: CartItem[], coupon?: { off: number }) => {
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const discount = coupon ? (subtotal * coupon.off) / 100 : 0;
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total };
};
