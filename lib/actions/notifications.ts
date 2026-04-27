"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Notification = {
  id: string;
  type: "new_order" | "order_updated" | "contact_form" | "low_stock" | string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown>;
  created_at: string;
};

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const sb = createAdminClient();
  const { count, error } = await sb
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  const sb = createAdminClient();
  await sb.from("notifications").update({ read: true }).eq("id", id);
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsRead() {
  const sb = createAdminClient();
  await sb.from("notifications").update({ read: true }).eq("read", false);
  revalidatePath("/admin/notifications");
}

export async function deleteNotification(id: string) {
  const sb = createAdminClient();
  await sb.from("notifications").delete().eq("id", id);
  revalidatePath("/admin/notifications");
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const sb = createAdminClient();
  const { error } = await sb.from("contact_messages").insert(data);
  if (error) throw new Error(error.message);
}

/* ── Social-proof purchase notifications ──────────────────────────────── */

export type SocialProofItem = {
  firstName:    string;
  city:         string;
  province:     string;
  phone:        string;
  productTitle: string;
  productImage: string | null;
  quantity:     number;
  rating:       number;
  review:       string;
  status:       string;
};

const SP_NAMES    = ["Malaika","Mahnoor","Laiba","Hoorain","Dua","Mahira","Rimsha","Nimra","Areeba","Shanzay","Mehak","Anaya","Zara","Maha","Afreen","Bisma","Saba","Hana","Alisha","Rida","Inaya","Palwasha","Eman","Sahar","Munira"];
const SP_CITIES   = ["Karachi","Lahore","Islamabad","Rawalpindi","Peshawar","Multan","Faisalabad","Sialkot","Hyderabad","Quetta","Gujranwala","Abbottabad"];

const PROVINCE_MAP: Record<string, string> = {
  Karachi: "Sindh", Lahore: "Punjab", Islamabad: "ICT", Rawalpindi: "Punjab",
  Peshawar: "KPK", Multan: "Punjab", Faisalabad: "Punjab", Sialkot: "Punjab",
  Hyderabad: "Sindh", Quetta: "Balochistan", Gujranwala: "Punjab", Abbottabad: "KPK",
};

const SP_REVIEWS = [
  "The fabric quality is exceptional — exactly what I was hoping for!",
  "Wore this to a wedding and received so many compliments. Stunning!",
  "Stitching and embroidery are flawless. Will definitely order again.",
  "Even more beautiful in person than in the photos. Love it!",
  "Perfect for formal events — the dupatta detailing is gorgeous.",
  "Delivered on time, packaged beautifully. Felt like a luxury gift.",
  "My sisters and I all ordered from here now. Best Pakistani fashion store!",
  "Material is premium quality and very comfortable to wear all day.",
  "Ordered for Eid and received it on time. Absolutely beautiful piece.",
  "Worth every rupee. The craftsmanship truly reflects heritage and elegance.",
  "Customer service was excellent and the suit exceeded my expectations.",
  "I keep getting asked where I bought this outfit — so proud to share!",
];

const SP_STATUSES = [
  "Selling fast · Confirmed order",
  "Sale confirmed · Popular item",
  "New purchase · Trending now",
  "Order placed · Limited stock",
  "Live sale · Just confirmed",
];

const SP_PREFIXES = ["300","301","303","306","311","312","321","333","345","347"];

function spMaskedPhone(i: number): string {
  const prefix = SP_PREFIXES[i % SP_PREFIXES.length];
  const tail   = String(100 + (i * 37 + 19) % 900).slice(-2);
  return `+92 ${prefix} ●●● ●●${tail}`;
}

function spShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getRecentPurchaseNotifications(): Promise<SocialProofItem[]> {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("orders")
      .select("customer_name, address, order_items(product_title, product_image, quantity)")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error || !data) return [];

    type RawItem = { product_title: string; product_image: string | null; quantity: number };

    const real: SocialProofItem[] = data
      .filter((o) => Array.isArray(o.order_items) && (o.order_items as unknown[]).length > 0)
      .map((o, idx) => {
        const addr  = (o.address ?? {}) as Record<string, string>;
        const items = o.order_items as RawItem[];
        const item  = items.find((i) => i.product_image) ?? items[0];
        const city  = addr.city?.trim() || "Karachi";
        return {
          firstName:    o.customer_name.split(" ")[0],
          city,
          province:     PROVINCE_MAP[city] ?? "Pakistan",
          phone:        spMaskedPhone(idx),
          productTitle: item.product_title,
          productImage: item.product_image,
          quantity:     item.quantity,
          rating:       idx % 3 === 0 ? 4 : 5,
          review:       SP_REVIEWS[idx % SP_REVIEWS.length],
          status:       SP_STATUSES[idx % SP_STATUSES.length],
        };
      });

    const pad = Math.max(0, 10 - real.length);
    const synthetic: SocialProofItem[] = Array.from({ length: pad }, (_, i) => {
      const source   = real[i % Math.max(real.length, 1)];
      const city     = SP_CITIES[i % SP_CITIES.length];
      return {
        firstName:    SP_NAMES[i % SP_NAMES.length],
        city,
        province:     PROVINCE_MAP[city] ?? "Pakistan",
        phone:        spMaskedPhone(i + 50),
        productTitle: source?.productTitle ?? "Habiba Minhas Collection",
        productImage: source?.productImage ?? null,
        quantity:     1,
        rating:       i % 4 === 0 ? 4 : 5,
        review:       SP_REVIEWS[(i + 3) % SP_REVIEWS.length],
        status:       SP_STATUSES[(i + 1) % SP_STATUSES.length],
      };
    });

    return spShuffle([...real, ...synthetic]);
  } catch {
    return [];
  }
}
