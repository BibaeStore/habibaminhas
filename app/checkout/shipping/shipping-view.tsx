"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { formatPrice } from "@/lib/utils";
import type { ShippingConfig } from "@/lib/actions/settings";

export function ShippingView({ shipping: shippingCfg }: { shipping: ShippingConfig }) {
  const { items } = useCartStore();
  const { shipping: saved, setShipping } = useCheckoutStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const [method, setMethod] = useState<"standard" | "express">(
    saved?.shippingMethod ?? "standard"
  );
  const shippingCost =
    method === "express"
      ? shippingCfg.express
      : shippingCfg.standard;
  const total = subtotal + shippingCost;

  const [form, setForm] = useState({
    firstName: saved?.firstName ?? "",
    lastName: saved?.lastName ?? "",
    phone: saved?.phone ?? "",
    email: saved?.email ?? "",
    street: saved?.street ?? "",
    apartment: saved?.apartment ?? "",
    city: saved?.city ?? "",
    province: saved?.province ?? "",
    postalCode: saved?.postalCode ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) router.replace("/cart");
  }, [mounted, items, router]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.province) e.province = "Required";
    return e;
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setShipping({ ...form, shippingMethod: method, shippingCost, giftMessage: "", paymentMethod: "cod" });
    router.push("/checkout/payment");
  }

  const field = (name: keyof typeof form, label: string, type = "text", placeholder = "", className = "") => (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => set(name, e.target.value)}
        className={`h-12 border bg-cream px-3 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory ${
          errors[name] ? "border-sale" : "border-border-soft"
        }`}
      />
      {errors[name] && <span className="text-[11px] text-sale">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">

      <div className="mb-10 flex items-center gap-0">
        {[
          { n: 1, label: "Bag", href: "/cart", done: true },
          { n: 2, label: "Shipping", href: "/checkout/shipping", active: true },
          { n: 3, label: "Payment", href: "/checkout/payment" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center text-[12px] font-medium transition-colors ${
                step.done ? "bg-gold-dark text-ivory" : step.active ? "bg-ink text-ivory" : "border border-border-soft bg-cream text-muted"
              }`}>
                {step.done ? <Check className="h-3.5 w-3.5" /> : step.n}
              </div>
              <span className={`mt-1.5 hidden text-[10px] uppercase tracking-[0.24em] sm:block ${
                step.active ? "text-ink" : "text-muted"
              }`}>{step.label}</span>
            </div>
            {i < 2 && (
              <div className={`mx-3 h-px w-12 sm:w-20 ${step.done ? "bg-gold-dark" : "bg-border-soft"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

        <div className="lg:col-span-7">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">Step 2 of 3</span>
          <h1 className="mt-2 font-display text-4xl italic sm:text-5xl">Shipping.</h1>

          <form onSubmit={handleContinue} className="mt-8 flex flex-col gap-8" noValidate>

            <section>
              <h2 className="font-display text-xl italic text-ink-soft">Contact</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("firstName", "First name")}
                {field("lastName", "Last name")}
                {field("phone", "Phone number (WhatsApp preferred)", "tel", "+92 3XX XXXXXXX", "sm:col-span-2")}
                {field("email", "Email address", "email", "", "sm:col-span-2")}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl italic text-ink-soft">Delivery address</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("street", "Street address", "text", "House/flat no., street, area", "sm:col-span-2")}
                <label className="sm:col-span-2 flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                    Apartment / Floor / Landmark (optional)
                  </span>
                  <input
                    value={form.apartment}
                    onChange={(e) => set("apartment", e.target.value)}
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-ivory"
                  />
                </label>
                {field("city", "City")}
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">Province</span>
                  <select
                    value={form.province}
                    onChange={(e) => set("province", e.target.value)}
                    className={`h-12 border bg-cream px-3 text-[14px] outline-none transition-colors focus:border-ink focus:bg-ivory ${
                      errors.province ? "border-sale" : "border-border-soft"
                    }`}
                  >
                    <option value="">Select province</option>
                    <option>Sindh</option>
                    <option>Punjab</option>
                    <option>KPK</option>
                    <option>Balochistan</option>
                    <option>Islamabad Capital Territory</option>
                    <option>AJK</option>
                    <option>Gilgit-Baltistan</option>
                  </select>
                  {errors.province && <span className="text-[11px] text-sale">{errors.province}</span>}
                </label>
                {field("postalCode", "Postal code")}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl italic text-ink-soft">Delivery method</h2>
              <div className="mt-4 flex flex-col gap-3">

                <label
                  className={`flex cursor-pointer items-center justify-between border-2 px-4 py-4 transition-colors ${
                    method === "standard" ? "border-ink bg-cream" : "border-border-soft bg-ivory hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      method === "standard" ? "border-ink bg-ink" : "border-border-soft"
                    }`}>
                      {method === "standard" && <span className="h-1.5 w-1.5 rounded-full bg-ivory" />}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">Standard Delivery · {shippingCfg.estimatedStd} business days</div>
                      <div className="text-[12px] text-ink-soft">{shippingCfg.carrier} Courier — tracking provided</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium">
                    {formatPrice(shippingCfg.standard)}
                  </div>
                  <input
                    type="radio"
                    name="shipping"
                    checked={method === "standard"}
                    onChange={() => setMethod("standard")}
                    className="sr-only"
                  />
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between border-2 px-4 py-4 transition-colors ${
                    method === "express" ? "border-ink bg-cream" : "border-border-soft bg-ivory hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      method === "express" ? "border-ink bg-ink" : "border-border-soft"
                    }`}>
                      {method === "express" && <span className="h-1.5 w-1.5 rounded-full bg-ivory" />}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">Express Delivery · {shippingCfg.estimatedExp} business days</div>
                      <div className="text-[12px] text-ink-soft">{shippingCfg.carrier} Overnight — Karachi, Lahore, Islamabad only</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium">{formatPrice(shippingCfg.express)}</div>
                  <input
                    type="radio"
                    name="shipping"
                    checked={method === "express"}
                    onChange={() => setMethod("express")}
                    className="sr-only"
                  />
                </label>

              </div>
            </section>

            <div className="flex items-center justify-between gap-4 border-t border-border-soft pt-6">
              <Link href="/cart" className="text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink">
                ← Back to bag
              </Link>
              <button
                type="submit"
                className="flex h-14 items-center gap-2 bg-ink px-10 text-[12px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-gold-dark"
              >
                Continue to payment <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        <aside className="lg:col-span-5">
          <div
            className="sticky flex flex-col gap-5 border border-border-soft bg-cream p-6"
            style={{ top: "calc(var(--header-h) + 24px)" }}
          >
            <h2 className="font-display text-2xl italic">Order summary</h2>
            <ul className="flex flex-col gap-4 border-b border-border-soft pb-5">
              {items.map((item) => (
                <li key={item.cartKey} className="flex gap-4">
                  <div className="relative w-14 flex-none aspect-[3/4] bg-ivory overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover object-top" />
                    ) : (
                      <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${item.palette[0]}, ${item.palette[1] ?? item.palette[0]})` }} />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2 text-[13px]">
                    <div>
                      <div className="font-medium leading-snug">{item.title}</div>
                      {item.size && item.size !== "onesize" && (
                        <div className="mt-0.5 text-[11px] text-muted">{item.size}</div>
                      )}
                    </div>
                    <div className="shrink-0 font-medium">{formatPrice(item.price * item.qty)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>{formatPrice(shippingCost)}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between border-t border-border-soft pt-4 text-[15px] font-medium">
              <span>Total</span>
              <span className="font-display text-2xl">{formatPrice(total)}</span>
            </div>
            <ul className="grid grid-cols-1 gap-2 pt-1 text-[11px] text-ink-soft">
              <li className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-gold-dark" /> {`Flat ${formatPrice(shippingCfg.standard)} delivery nationwide`}</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-gold-dark" /> 14-day hassle-free returns</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> Secure encrypted checkout</li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
