"use client";

import Image from "next/image";
import { useState } from "react";
import { Mail, Phone, Package, Truck, Users, CheckCircle } from "lucide-react";
import { submitContactMessage } from "@/lib/actions/notifications";

export default function WholesalePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    orderType: "Boutique/Retailer",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: `Wholesale Inquiry - ${form.orderType}`,
        message: `Company: ${form.company}\nCity: ${form.city}\nOrder Type: ${form.orderType}\n\nMessage:\n${form.message}`,
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src="/editorial/ladies-collection.webp"
          alt="Wholesale Inquiries — Habiba Minhas Pakistan"
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-ivory px-6">
          <span className="text-[11px] uppercase tracking-[0.34em] text-gold-light">
            Wholesale & Bulk Orders
          </span>
          <h1 className="mt-3 font-display text-5xl italic leading-tight sm:text-6xl">
            Partner with us.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed opacity-90">
            Special pricing for boutiques, retailers & corporate gifting across Pakistan.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="border border-border-soft bg-cream p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border-soft bg-ivory">
            <Package className="h-6 w-6 text-gold-dark" />
          </div>
          <h3 className="mt-4 font-display text-xl italic">Competitive Pricing</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Special wholesale rates for bulk orders. Volume discounts available.
          </p>
        </div>

        <div className="border border-border-soft bg-cream p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border-soft bg-ivory">
            <Truck className="h-6 w-6 text-gold-dark" />
          </div>
          <h3 className="mt-4 font-display text-xl italic">Nationwide Delivery</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Reliable shipping to boutiques across Pakistan. Karachi, Lahore, Islamabad & more.
          </p>
        </div>

        <div className="border border-border-soft bg-cream p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border-soft bg-ivory">
            <Users className="h-6 w-6 text-gold-dark" />
          </div>
          <h3 className="mt-4 font-display text-xl italic">Dedicated Support</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Personal account manager for your wholesale needs. Quick turnaround times.
          </p>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="mt-20">
        <div className="max-w-3xl">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Who We Work With
          </span>
          <h2 className="mt-3 font-display text-4xl italic leading-tight">
            Boutiques, retailers, and businesses across Pakistan.
          </h2>
          <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-ink-soft">
            <p>
              Habiba Minhas partners with boutiques, multi-brand retailers, corporate gifting
              companies, and wedding planners across Pakistan. Our wholesale program offers
              exclusive pricing on bulk orders of ladies formal suits, kids festive wear,
              baby products, and handcrafted accessories.
            </p>
            <p>
              We maintain strict quality standards and provide consistent stock availability
              to ensure your business can rely on Habiba Minhas as a trusted supplier.
            </p>
          </div>

          <ul className="mt-8 space-y-3 text-[14px]">
            {[
              "Minimum order quantity: 10 pieces (mixed products accepted)",
              "Volume discounts: 15-30% based on order size",
              "Payment terms: Advance payment or credit for established accounts",
              "Delivery: 3-5 business days across Pakistan",
              "Returns: Wholesale return policy available upon request",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage" />
                <span className="text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="mt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
              Get Started
            </span>
            <h2 className="mt-3 font-display text-4xl italic leading-tight">
              Submit a wholesale inquiry.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
              Fill out the form and our wholesale team will contact you within 24 hours
              with pricing, product catalogs, and terms.
            </p>

            <div className="mt-10 flex flex-col gap-6 text-[14px]">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                    Email
                  </div>
                  <a
                    href="mailto:wholesale@habibaminhas.com"
                    className="hover:text-gold-dark transition-colors"
                  >
                    wholesale@habibaminhas.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                    WhatsApp
                  </div>
                  <a
                    href="https://wa.me/923120295812"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-dark transition-colors"
                  >
                    +92 312 0295812
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {sent ? (
              <div className="flex flex-col items-center gap-4 border border-border-soft bg-cream py-14 text-center">
                <CheckCircle className="h-10 w-10 text-sage" />
                <h3 className="font-display text-3xl italic">Inquiry submitted.</h3>
                <p className="max-w-sm text-[13px] leading-relaxed text-ink-soft">
                  Our wholesale team will contact you within 24 hours with pricing
                  and product information.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      company: "",
                      city: "",
                      orderType: "Boutique/Retailer",
                      message: "",
                    });
                  }}
                  className="mt-2 h-11 border border-ink px-6 text-[12px] uppercase tracking-[0.24em] hover:bg-ink hover:text-ivory transition-colors"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {error && (
                  <div className="sm:col-span-2 border border-sale/40 bg-sale/10 px-4 py-3 text-[12px] text-sale">
                    {error}
                  </div>
                )}

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    Your Name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={set("name")}
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    Email Address
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    Phone Number
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+92 XXX XXXXXXX"
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    Company/Business Name
                  </span>
                  <input
                    required
                    value={form.company}
                    onChange={set("company")}
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    City
                  </span>
                  <input
                    required
                    value={form.city}
                    onChange={set("city")}
                    placeholder="e.g., Karachi, Lahore, Islamabad"
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    Order Type
                  </span>
                  <select
                    value={form.orderType}
                    onChange={set("orderType")}
                    className="h-12 border border-border-soft bg-cream px-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  >
                    <option>Boutique/Retailer</option>
                    <option>Corporate Gifting</option>
                    <option>Wedding Planner</option>
                    <option>Event/Exhibition</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="sm:col-span-2 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                    Message & Requirements
                  </span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us about your business, expected order quantity, and specific product interests..."
                    className="border border-border-soft bg-cream px-3 py-3 text-[14px] outline-none focus:border-ink focus:bg-ivory"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="sm:col-span-2 h-14 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark disabled:opacity-60 transition-colors"
                >
                  {loading ? "Submitting..." : "Submit Wholesale Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
