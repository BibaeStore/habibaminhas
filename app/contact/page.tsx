"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { submitContactMessage } from "@/lib/actions/notifications";
import { BUSINESS_ADDRESS_LINES } from "@/lib/business-info";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Order status", message: "" });
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
        phone: form.phone || "",
        subject: form.subject,
        message: form.message,
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            Get in touch
          </span>
          <h1 className="mt-3 font-display text-5xl italic leading-tight sm:text-6xl">
            Say hello.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-soft">
            Order queries, return requests, or anything else — send us a note
            or reach us directly on WhatsApp. We respond within 24 hours,
            Monday to Friday. Online shopping available 24/7.
          </p>
          <ul className="mt-10 flex flex-col gap-6 text-[14px]">
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Email</div>
                <a href="mailto:info@habibaminhas.com" className="hover:text-gold-dark transition-colors">info@habibaminhas.com</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">WhatsApp</div>
                <a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark transition-colors">+92 312 0295812</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Location</div>
                {BUSINESS_ADDRESS_LINES.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Operating Hours</div>
                <div>Mon–Fri · 9:00 AM — 6:00 PM (PKT)</div>
                <div className="mt-1 text-[11px] text-sage">🛍️ Shop online 24/7</div>
              </div>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7">
          <div className="relative h-56 overflow-hidden">
            <Image
              src="/editorial/ladies-collection.webp"
              alt="Habiba Minhas Studio — Karachi"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
              <div className="text-[11px] uppercase tracking-[0.28em] opacity-85">Karachi Studio</div>
              <div className="font-display text-2xl italic">Handcrafted in Pakistan</div>
            </div>
          </div>

          {sent ? (
            <div className="mt-8 flex flex-col items-center gap-4 border border-border-soft bg-cream py-14 text-center">
              <CheckCircle className="h-10 w-10 text-sage" />
              <h2 className="font-display text-3xl italic">Message sent.</h2>
              <p className="max-w-sm text-[13px] leading-relaxed text-ink-soft">
                Thank you for reaching out. We will get back to you within 24 hours.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "Order status", message: "" }); }}
                className="mt-2 h-11 border border-ink px-6 text-[12px] uppercase tracking-[0.24em] hover:bg-ink hover:text-ivory transition-colors"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {error && (
                <div className="sm:col-span-2 border border-sale/40 bg-sale/10 px-4 py-3 text-[12px] text-sale">
                  {error}
                </div>
              )}
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Name</span>
                <input
                  required
                  value={form.name}
                  onChange={set("name")}
                  className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Phone (optional)</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Subject</span>
                <select
                  value={form.subject}
                  onChange={set("subject")}
                  className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
                >
                  <option>Order status</option>
                  <option>Exchange or return</option>
                  <option>Fabric question</option>
                  <option>Press</option>
                  <option>Something else</option>
                </select>
              </label>
              <label className="sm:col-span-2 flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Message</span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={set("message")}
                  className="border border-border-soft bg-ivory px-3 py-3 text-[14px] outline-none focus:border-ink"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="sm:col-span-2 inline-flex h-14 items-center justify-center gap-2 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark disabled:opacity-60 transition-colors"
              >
                {loading ? "Sending…" : "Send message"}
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 border-t border-border-soft pt-16">
          <h2 className="text-center font-display text-4xl italic sm:text-5xl mb-12">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h3 className="font-display text-2xl italic text-ink">
                How quickly will I receive a response?
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                We respond to all inquiries within 24 hours, Monday through Friday. For urgent matters, WhatsApp is the fastest way to reach us at +92 312 0295812.
              </p>
            </div>

            <div>
              <h3 className="font-display text-2xl italic text-ink">
                What are your customer service hours?
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Our customer service team is available Monday to Friday, 10:00 AM - 6:00 PM PKT. Weekend messages are answered on the following Monday.
              </p>
            </div>

            <div>
              <h3 className="font-display text-2xl italic text-ink">
                Can I visit your store in person?
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                We operate as an online-first brand based in Karachi, Pakistan. For appointments or special requests, please contact us directly via WhatsApp or email.
              </p>
            </div>

            <div>
              <h3 className="font-display text-2xl italic text-ink">
                Do you accept custom order requests?
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Yes! For custom embroidery, special sizing, or bulk orders, please reach out via the contact form above with your requirements and we'll get back to you with details.
              </p>
            </div>
          </div>
        </div>

      {/* Quick Links Section */}
      <div className="mt-20 border-t border-border-soft pt-12">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold-dark mb-6">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-display text-lg italic mb-3">Shop</h3>
              <ul className="space-y-2 text-[13px]">
                <li><Link href="/ladies" className="text-ink-soft hover:text-gold-dark transition-colors">Ladies Suits</Link></li>
                <li><Link href="/kids" className="text-ink-soft hover:text-gold-dark transition-colors">Kids Formal</Link></li>
                <li><Link href="/baby" className="text-ink-soft hover:text-gold-dark transition-colors">Baby Products</Link></li>
                <li><Link href="/accessories" className="text-ink-soft hover:text-gold-dark transition-colors">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg italic mb-3">Help</h3>
              <ul className="space-y-2 text-[13px]">
                <li><Link href="/help/shipping" className="text-ink-soft hover:text-gold-dark transition-colors">Shipping Info</Link></li>
                <li><Link href="/help/returns" className="text-ink-soft hover:text-gold-dark transition-colors">Returns & Exchanges</Link></li>
                <li><Link href="/help/payments" className="text-ink-soft hover:text-gold-dark transition-colors">Payment Methods</Link></li>
                <li><Link href="/help/faq" className="text-ink-soft hover:text-gold-dark transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg italic mb-3">About</h3>
              <ul className="space-y-2 text-[13px]">
                <li><Link href="/about" className="text-ink-soft hover:text-gold-dark transition-colors">Our Story</Link></li>
                <li><Link href="/about/author" className="text-ink-soft hover:text-gold-dark transition-colors">Meet the Founder</Link></li>
                <li><Link href="/journal" className="text-ink-soft hover:text-gold-dark transition-colors">The Journal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg italic mb-3">Popular</h3>
              <ul className="space-y-2 text-[13px]">
                <li><Link href="/new" className="text-ink-soft hover:text-gold-dark transition-colors">New Arrivals</Link></li>
                <li><Link href="/offers" className="text-ink-soft hover:text-gold-dark transition-colors">Special Offers</Link></li>
                <li><Link href="/wholesale" className="text-ink-soft hover:text-gold-dark transition-colors">Wholesale</Link></li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
}
