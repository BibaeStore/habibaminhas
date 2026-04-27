import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  cartKey: string; // slug + ":" + (size ?? "onesize")
  id: string;
  slug: string;
  title: string;
  image: string | null;
  palette: string[];
  price: number;
  compare_at: number | null;
  qty: number;
  size: string | null;
  sku: string | null;
};

interface CartStore {
  items: CartItem[];
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "cartKey" | "qty">) => void;
  removeItem: (cartKey: string) => void;
  updateQty: (cartKey: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      addItem: (item) => {
        const cartKey = `${item.slug}:${item.size ?? "onesize"}`;
        const existing = get().items.find((i) => i.cartKey === cartKey);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, cartKey, qty: 1 }] });
        }
      },
      removeItem: (cartKey) =>
        set({ items: get().items.filter((i) => i.cartKey !== cartKey) }),
      updateQty: (cartKey, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.cartKey !== cartKey) });
        } else {
          set({
            items: get().items.map((i) =>
              i.cartKey === cartKey ? { ...i, qty } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: "hm-cart", storage: createJSONStorage(() => localStorage) }
  )
);
