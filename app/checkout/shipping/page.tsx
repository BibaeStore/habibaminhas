import { ShippingView } from "./shipping-view";
import { getStorefrontSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const settings = await getStorefrontSettings();
  return <ShippingView shipping={settings.shipping} />;
}
