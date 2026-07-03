import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { products, type Product } from "@/data/products";

export type CartItem = {
  product: Product;
  qty: number;
  size: string;
  color: string;
};

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  shippingDetails: {
    name: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'cod';
  paymentNumber?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
};

export type ShippingAddress = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  isDefault: boolean;
};

export type SavedPaymentMethod = {
  id: string;
  type: 'visa' | 'mastercard' | 'bkash' | 'nagad';
  cardHolder: string;
  number: string;
  expiry?: string;
  isDefault: boolean;
};

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  coupon?: { code: string; off: number };
  addresses: ShippingAddress[];
  paymentMethods: SavedPaymentMethod[];
  addToCart: (p: Product, size: string, color: string, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  applyCoupon: (code: string) => boolean;
  createOrder: (
    shippingDetails: Order['shippingDetails'],
    paymentMethod: Order['paymentMethod'],
    paymentNumber: string
  ) => Order;
  cancelOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  
  // Addresses Actions
  addAddress: (addr: Omit<ShippingAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;
  updateAddress: (id: string, addr: Partial<ShippingAddress>) => void;
  setDefaultAddress: (id: string) => void;

  // Payment Methods Actions
  addPaymentMethod: (pm: Omit<SavedPaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
};

// Initial seeded order matching the notifications (#VV-9082)
const SEEDED_ORDERS: Order[] = [
  {
    id: "VV-9082",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 days ago
    items: [
      {
        product: products[6] || {
          id: "p7",
          name: "Premium Leather Jacket",
          brand: "Nike",
          price: 139,
          rating: 4.7,
          reviews: 278,
          category: "men",
          colors: ["#1a1a1a"],
          sizes: ["L"],
          images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80"],
          description: "Premium handcrafted leather jacket with raw details and vintage finish."
        },
        qty: 1,
        size: "L",
        color: "#1a1a1a"
      }
    ],
    shippingDetails: {
      name: "Jane Doe",
      phone: "01712345678",
      address: "123 Fashion Ave, Suite 400",
      city: "Dhaka",
      zip: "1212"
    },
    paymentMethod: "bkash",
    paymentNumber: "01712345678",
    subtotal: 139,
    discount: 0,
    tax: 13.9,
    total: 152.9,
    status: "shipped"
  }
];

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      orders: SEEDED_ORDERS,
      addresses: [
        {
          id: 'addr-1',
          name: 'Jane Doe',
          phone: '01712345678',
          address: '123 Fashion Ave, Suite 400',
          city: 'Dhaka',
          zip: '1212',
          isDefault: true
        },
        {
          id: 'addr-2',
          name: 'Jane Doe (Office)',
          phone: '01887654321',
          address: 'Stylofy Tech Park, Floor 5, Block B',
          city: 'Dhaka',
          zip: '1230',
          isDefault: false
        }
      ],
      paymentMethods: [
        {
          id: 'pm-1',
          type: 'visa',
          cardHolder: 'JANE DOE',
          number: '4242••••••••4242',
          expiry: '12/29',
          isDefault: true
        },
        {
          id: 'pm-2',
          type: 'bkash',
          cardHolder: 'Jane Doe',
          number: '017••••5678',
          isDefault: false
        }
      ],
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
      createOrder: (shippingDetails, paymentMethod, paymentNumber) => {
        const cart = get().cart;
        const coupon = get().coupon;
        const totals = cartTotals(cart, coupon);
        
        // Generate random order ID matching style VV-XXXX
        const randId = `VV-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newOrder: Order = {
          id: randId,
          date: new Date().toISOString(),
          items: [...cart],
          shippingDetails,
          paymentMethod,
          paymentNumber: paymentNumber || undefined,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: parseFloat((totals.subtotal * 0.1).toFixed(2)),
          total: parseFloat((totals.subtotal * 1.1 - totals.discount).toFixed(2)),
          status: 'placed'
        };

        // Prepend to orders list
        set({ 
          orders: [newOrder, ...get().orders],
          cart: [],
          coupon: undefined 
        });

        return newOrder;
      },
      cancelOrder: (id) => {
        set({
          orders: get().orders.map(order => 
            order.id === id ? { ...order, status: 'cancelled' as const } : order
          )
        });
      },
      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map(order => 
            order.id === id ? { ...order, status } : order
          )
        });
      },

      // Addresses implementations
      addAddress: (addr) => {
        const id = `addr-${Math.floor(Math.random() * 10000)}`;
        const list = get().addresses;
        const newAddr = { ...addr, id };
        if (addr.isDefault) {
          set({
            addresses: list.map(a => ({ ...a, isDefault: false })).concat(newAddr)
          });
        } else {
          set({ addresses: [...list, newAddr] });
        }
      },
      deleteAddress: (id) => {
        const list = get().addresses.filter(a => a.id !== id);
        if (list.length > 0 && !list.some(a => a.isDefault)) {
          list[0].isDefault = true;
        }
        set({ addresses: list });
      },
      updateAddress: (id, addr) => {
        const list = get().addresses.map(a => {
          if (a.id === id) {
            return { ...a, ...addr };
          }
          return a;
        });
        if (addr.isDefault) {
          set({
            addresses: list.map(a => ({ ...a, isDefault: a.id === id }))
          });
        } else {
          set({ addresses: list });
        }
      },
      setDefaultAddress: (id) => {
        set({
          addresses: get().addresses.map(a => ({ ...a, isDefault: a.id === id }))
        });
      },

      // Payment methods implementations
      addPaymentMethod: (pm) => {
        const id = `pm-${Math.floor(Math.random() * 10000)}`;
        const list = get().paymentMethods;
        const newPm = { ...pm, id };
        if (pm.isDefault) {
          set({
            paymentMethods: list.map(p => ({ ...p, isDefault: false })).concat(newPm)
          });
        } else {
          set({ paymentMethods: [...list, newPm] });
        }
      },
      deletePaymentMethod: (id) => {
        const list = get().paymentMethods.filter(p => p.id !== id);
        if (list.length > 0 && !list.some(p => p.isDefault)) {
          list[0].isDefault = true;
        }
        set({ paymentMethods: list });
      },
      setDefaultPaymentMethod: (id) => {
        set({
          paymentMethods: get().paymentMethods.map(p => ({ ...p, isDefault: p.id === id }))
        });
      }
    }),
    { 
      name: "stylofy-shop-v2",
      storage: createJSONStorage(() => AsyncStorage)
    },
  ),
);

export const cartTotals = (cart: CartItem[], coupon?: { off: number }) => {
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const discount = coupon ? (subtotal * coupon.off) / 100 : 0;
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total };
};


