import { create } from "zustand";

/*
 * Which colourway is selected on a product page, keyed by slug.
 *
 * The gallery and the add-to-bag panel are separate client islands under a server page, so
 * they share the choice through this store rather than a wrapping client component — the
 * page's server-rendered structure stays the same for every product. Not persisted: a
 * returning visitor starts on the first colour, which is also what the server rendered.
 */
interface ColourSelectionStore {
  bySlug: Record<string, number>;
  select: (slug: string, index: number) => void;
}

export const useColourSelectionStore = create<ColourSelectionStore>()((set) => ({
  bySlug: {},
  select: (slug, index) => set((s) => ({ bySlug: { ...s.bySlug, [slug]: index } })),
}));
