import { PaymentView } from "./payment-view";
import { getStorefrontSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const settings = await getStorefrontSettings();
  return <PaymentView payment={settings.payment} shipping={settings.shipping} />;
}
