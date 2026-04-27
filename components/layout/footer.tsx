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
      { label: "Ladies Suits",       href: "/ladies"      },
      { label: "Kids Formal Wear",   href: "/kids"        },
      { label: "Baby Bedding",       href: "/baby"        },
      { label: "Baby Nests",         href: "/baby"        },
      { label: "Accessories",        href: "/accessories" },
      { label: "New Arrivals",       href: "/new"         },
    ],
  },
];

const services = [
  {
    icon: Package,
    title: "Flat Rs. 250 Delivery",
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
                className="h-[84px] w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ink-soft">
              Premium fashion & baby products — handcrafted with love in
              Pakistan. Ladies suits, kids formalwear, nursery essentials,
              and silk accessories for the modern family.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[
                { href: "https://www.instagram.com/habibaminhas.official/", label: "Instagram",  Icon: InstagramIcon  },
                { href: "https://www.facebook.com/profile.php?id=61573309750795", label: "Facebook", Icon: FacebookIcon  },
                { href: "https://www.youtube.com/@HabibaMinhas989",         label: "YouTube",   Icon: YouTubeIcon    },
                { href: "https://www.tiktok.com/@habibaminhas.official",    label: "TikTok",    Icon: TikTokIcon     },
                { href: "https://x.com/HabibaMinhas989",                    label: "X",         Icon: XIcon          },
                { href: "https://www.pinterest.com/habibaminhas989/",       label: "Pinterest", Icon: PinterestIcon  },
                { href: "https://www.quora.com/profile/Habiba-Minhas-5",    label: "Quora",     Icon: QuoraIcon      },
                { href: "https://www.reddit.com/user/HabibaMinhas_989/",    label: "Reddit",    Icon: RedditIcon     },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink transition-all hover:border-ink hover:bg-ink hover:text-ivory"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
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
            </ul>
          </div>
        </div>

        <Newsletter />

        {/* Trustpilot Reviews */}
        <div className="mt-14 border-t border-border-soft pt-10">
          <TrustpilotWidget />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border-soft pt-6 text-[11px] uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center">
          <div>© 2026 Habiba Minhas Atelier — All rights reserved</div>
          <div className="flex flex-wrap items-center gap-2">
            {paymentLogos.map(({ src, alt, w, h }) => (
              <div
                key={alt}
                className="flex h-8 items-center justify-center rounded border border-border-soft bg-ivory px-2"
              >
                <Image src={src} alt={alt} width={w} height={h} className="object-contain" style={{ maxHeight: 22 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const paymentLogos = [
  { src: "/logos/payments/visa.webp",         alt: "Visa",         w: 48, h: 30 },
  { src: "/logos/payments/mastercard.webp",   alt: "Mastercard",   w: 36, h: 28 },
  { src: "/logos/payments/jazzcash.webp",     alt: "JazzCash",     w: 48, h: 48 },
  { src: "/logos/payments/easypaisa.webp",    alt: "Easypaisa",    w: 48, h: 48 },
  { src: "/logos/payments/cod.webp",          alt: "Cash on Delivery", w: 48, h: 28 },
];
