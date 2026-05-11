import { CartView } from "./cart-view";
import { getStorefrontSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getStorefrontSettings();
  return <CartView shipping={settings.shipping} />;
}
