import Link from "next/link";
import Image from "next/image";
import { Package, RotateCcw, MapPin, ShieldCheck } from "lucide-react";
import { Newsletter } from "./newsletter";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 8h2V5h-2.5A3.5 3.5 0 0 0 10 8.5V11H8v3h2v6h3v-6h2.2l.3-3H13V9a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 10l4 2-4 2v-4Z" fill="currentColor" />
    </svg>
  );
}

const linkCols = [
  {
    heading: "Customer Care",
    links: [
      { label: "FAQs", href: "/help/faq" },
      { label: "Exchange & Returns", href: "/help/returns" },
      { label: "Shipping Info", href: "/help/shipping" },
      { label: "Contact Us", href: "/contact" },
      { label: "Payment Methods", href: "/help/payments" },
    ],
  },
  {
    heading: "Information",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Wholesale Enquiries", href: "/contact" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    heading: "Shop",
    links: [
      { label: "Ladies Suits", href: "/ladies/suits" },
      { label: "Kids Formal Wear", href: "/kids/girls" },
      { label: "Baby Bedding", href: "/baby/bedding" },
      { label: "Baby Nests & Loungers", href: "/baby/nests" },
      { label: "Accessories", href: "/accessories/hair" },
    ],
  },
];

const services = [
  {
    icon: Package,
    title: "Flat Rs. 200 Delivery",
    subtitle: "Nationwide shipping across all of Pakistan.",
    href: "/help/shipping",
  },
  {
    icon: RotateCcw,
    title: "14-Day Returns",
    subtitle: "Easy returns within 14 days of delivery.",
    href: "/help/returns",
  },
  {
    icon: MapPin,
    title: "Based in Karachi",
    subtitle: "Handcrafted and dispatched from Karachi, Pakistan.",
    href: "/about",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    subtitle: "Card, COD, JazzCash and Easypaisa.",
    href: "/help/payments",
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border-soft bg-cream">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {services.map(({ icon: Icon, title, subtitle, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-3 border border-border-soft bg-ivory p-5 transition-colors hover:border-ink"
            >
              <Icon className="h-5 w-5 text-gold-dark" />
              <div>
                <div className="text-[12px] uppercase tracking-[0.22em] text-ink">
                  {title}
                </div>
                <div className="mt-1 text-[12px] leading-snug text-ink-soft">
                  {subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/">
              <Image
                src="/logo/habiba-minhas-logo-t.png"
                alt="Habiba Minhas"
                width={240}
                height={80}
                className="h-[68px] w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ink-soft">
              Premium fashion & baby products — handcrafted with love in
              Pakistan. Ladies suits, kids formalwear, nursery essentials,
              and silk accessories for the modern family.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/habibaminhas/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-ivory"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/profile.php?id=61574335512818"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-ivory"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@HabibaMinhas989"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-ivory"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com/@habibaminhas_989"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center border border-ink/20 text-[13px] font-semibold text-ink hover:border-ink hover:bg-ink hover:text-ivory"
              >
                Tt
              </a>
            </div>
          </div>

          {linkCols.map((col) => (
            <div key={col.heading} className="lg:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-dark">
                {col.heading}
              </div>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="link-underline text-[13px] text-ink-soft hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-dark">
              Contact
            </div>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px] text-ink-soft">
              <li><a href="mailto:info@habibaminhas.com" className="hover:text-gold-dark transition-colors">info@habibaminhas.com</a></li>
              <li><a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark transition-colors">+92 312 0295812</a></li>
              <li>Karachi, Pakistan — 75533</li>
              <li>Mon–Fri, 9a–6p PKT</li>
            </ul>
          </div>
        </div>

        <Newsletter />

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border-soft pt-6 text-[11px] uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center">
          <div>© 2026 Habiba Minhas Atelier — All rights reserved</div>
          <div className="flex items-center gap-3">
            <PayIcon label="Visa" />
            <PayIcon label="Master" />
            <PayIcon label="JazzCash" />
            <PayIcon label="Easypaisa" />
            <PayIcon label="COD" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function PayIcon({ label }: { label: string }) {
  return (
    <span className="flex h-7 items-center justify-center border border-border-soft bg-ivory px-2 text-[10px] font-semibold tracking-[0.16em] text-ink-soft">
      {label}
    </span>
  );
}
