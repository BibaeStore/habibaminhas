import Image from "next/image";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
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
            Monday to Friday.
          </p>
          <ul className="mt-10 flex flex-col gap-6 text-[14px]">
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                  Email
                </div>
                <a href="mailto:info@habibaminhas.com" className="hover:text-gold-dark transition-colors">info@habibaminhas.com</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                  WhatsApp
                </div>
                <a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark transition-colors">+92 312 0295812</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                  Location
                </div>
                <div>Karachi, Pakistan — 75533</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-border-soft bg-cream text-gold-dark">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">
                  Hours
                </div>
                <div>Mon–Fri · 9a — 6p PKT</div>
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
              <div className="text-[11px] uppercase tracking-[0.28em] opacity-85">
                Karachi Studio
              </div>
              <div className="font-display text-2xl italic">
                Handcrafted in Pakistan
              </div>
            </div>
          </div>
          <form className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Name
              </span>
              <input className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Email
              </span>
              <input
                type="email"
                className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink"
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Subject
              </span>
              <select className="h-11 border-0 border-b border-ink/25 bg-transparent text-[14px] outline-none focus:border-ink">
                <option>Order status</option>
                <option>Exchange or return</option>
                <option>Fabric question</option>
                <option>Press</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Message
              </span>
              <textarea
                rows={5}
                className="border border-border-soft bg-ivory px-3 py-3 text-[14px] outline-none focus:border-ink"
              />
            </label>
            <button className="sm:col-span-2 inline-flex h-14 items-center justify-center gap-2 bg-ink text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark">
              Send message
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
