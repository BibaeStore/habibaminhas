import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistStore {
  slugs: string[];
  toggle: (slug: string) => void;
  has:    (slug: string) => boolean;
  clear:  () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug)
            ? s.slugs.filter((x) => x !== slug)
            : [...s.slugs, slug],
        })),
      has:   (slug) => get().slugs.includes(slug),
      clear: ()     => set({ slugs: [] }),
    }),
    { name: "hm-wishlist", storage: createJSONStorage(() => localStorage) }
  )
);
