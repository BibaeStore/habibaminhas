import Link from "next/link";
import Image from "next/image";
import { Package, RotateCcw, MapPin, ShieldCheck } from "lucide-react";
import { Newsletter } from "./newsletter";
import { TrustpilotWidget } from "@/components/trustpilot-widget";
import {
  InstagramIcon, FacebookIcon, YouTubeIcon, TikTokIcon,
  XIcon, PinterestIcon, QuoraIcon, RedditIcon,
} from "@/components/common/social-icons";

const linkCols = [
  {
    heading: "Customer Care",
    links: [
      { label: "Track Your Order", href: "/track" },
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
      { label: "Ladies Suits", href: "/ladies" },
      { label: "Kids Formal Wear", href: "/kids" },
      { label: "Baby Bedding", href: "/baby" },
      { label: "Baby Nests", href: "/baby" },
      { label: "Accessories", href: "/accessories" },
      { label: "New Arrivals", href: "/new" },
    ],
  },
];

const services = [
  { icon: Package, title: "Flat Rs. 250 Delivery", subtitle: "Nationwide shipping across Pakistan.", href: "/help/shipping" },
  { icon: RotateCcw, title: "14-Day Returns", subtitle: "Easy returns within 14 days.", href: "/help/returns" },
  { icon: MapPin, title: "Based in Karachi", subtitle: "Handcrafted & dispatched from Karachi.", href: "/about" },
  { icon: ShieldCheck, title: "Secure Checkout", subtitle: "COD, JazzCash, Easypaisa & Card.", href: "/help/payments" },
];

const socialLinks = [
  { href: "https://www.instagram.com/habibaminhas.official/", label: "Instagram", Icon: InstagramIcon },
  { href: "https://www.facebook.com/profile.php?id=61573309750795", label: "Facebook", Icon: FacebookIcon },
  { href: "https://www.youtube.com/@HabibaMinhas989", label: "YouTube", Icon: YouTubeIcon },
  { href: "https://www.tiktok.com/@habibaminhas._official", label: "TikTok", Icon: TikTokIcon },
  { href: "https://x.com/HabibaMinhas_", label: "X", Icon: XIcon },
  { href: "https://www.pinterest.com/habibaminhas989/", label: "Pinterest", Icon: PinterestIcon },
  { href: "https://www.quora.com/profile/Habiba-Minhas-5", label: "Quora", Icon: QuoraIcon },
  { href: "https://www.reddit.com/user/HabibaMinhas_989/", label: "Reddit", Icon: RedditIcon },
];

const paymentLogos = [
  { src: "/logos/payments/visa.webp", alt: "Visa", w: 48, h: 30 },
  { src: "/logos/payments/mastercard.webp", alt: "Mastercard", w: 36, h: 28 },
  { src: "/logos/payments/jazzcash.webp", alt: "JazzCash", w: 48, h: 48 },
  { src: "/logos/payments/easypaisa.webp", alt: "Easypaisa", w: 48, h: 48 },
  { src: "/logos/payments/cod.webp", alt: "Cash on Delivery", w: 48, h: 28 },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink">

      {/* ── Newsletter — top, centered ─────────────────────────────── */}
      <Newsletter />

      {/* ── Thin gold divider ──────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
        <div className="h-px bg-ivory/10" />
      </div>

      {/* ── Service badges ─────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {services.map(({ icon: Icon, title, subtitle, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-3 border border-ivory/10 bg-ivory/5 p-5 transition-colors hover:border-gold-dark/50 hover:bg-ivory/10"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-ivory/80">{title}</div>
                <div className="mt-1 text-[11px] leading-snug text-ivory/40">{subtitle}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main footer grid ───────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 sm:px-8">
        <div className="h-px bg-ivory/10" />
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Habiba Minhas">
              <Image
                src="/logo/habiba-minhas-logo-t.png"
                alt="Habiba Minhas"
                width={240}
                height={80}
                className="h-[72px] w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-ivory/50">
              Premium fashion & baby products — handcrafted with love in
              Pakistan. Ladies suits, kids formalwear, nursery essentials,
              and silk accessories for the modern family.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center border border-ivory/20 text-ivory/60 transition-all hover:border-gold-dark hover:bg-gold-dark hover:text-ivory"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
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
                      className="text-[13px] text-ivory/50 transition-colors hover:text-gold-dark"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div className="lg:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-dark">Contact</div>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px] text-ivory/50">
              <li>
                <a href="mailto:info@habibaminhas.com" className="transition-colors hover:text-gold-dark">
                  info@habibaminhas.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold-dark">
                  +92 312 0295812
                </a>
              </li>
              <li className="text-ivory/30">Karachi, Pakistan — 75533</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Trustpilot ─────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
        <div className="border-t border-ivory/10 py-10">
          <TrustpilotWidget />
        </div>
      </div>

      {/* ── Bottom bar — copyright + payment logos ─────────────────── */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-ivory/10 pt-6 sm:flex-row sm:items-center">
          <div className="text-[11px] uppercase tracking-[0.22em] text-ivory/30">
            © 2026 Habiba Minhas Atelier — All rights reserved
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {paymentLogos.map(({ src, alt, w, h }) => (
              <div
                key={alt}
                className="flex h-8 items-center justify-center rounded bg-white px-3"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={w}
                  height={h}
                  className="object-contain"
                  style={{ maxHeight: 20 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
