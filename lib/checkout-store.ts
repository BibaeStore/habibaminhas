import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  shippingMethod: "standard" | "express";
  shippingCost: number;
  giftMessage: string;
  paymentMethod: string;
}

interface CheckoutStore {
  shipping: ShippingInfo | null;
  setShipping: (info: ShippingInfo) => void;
  setPaymentMethod: (method: string) => void;
  setGiftMessage: (msg: string) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      shipping: null,
      setShipping: (info) => set({ shipping: info }),
      setPaymentMethod: (method) =>
        set((s) =>
          s.shipping
            ? { shipping: { ...s.shipping, paymentMethod: method } }
            : s
        ),
      setGiftMessage: (msg) =>
        set((s) =>
          s.shipping
            ? { shipping: { ...s.shipping, giftMessage: msg } }
            : s
        ),
      clearCheckout: () => set({ shipping: null }),
    }),
    {
      name: "hm-checkout",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
    }
  )
);
