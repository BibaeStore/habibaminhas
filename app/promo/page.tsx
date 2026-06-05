import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PromoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8 font-sans">
      <div className="text-center mb-8 absolute top-8 left-8">
        <p className="text-sm text-gray-500 mb-2">Since the AI image generation quota was reached,</p>
        <p className="text-sm text-gray-500 mb-2">I built this pixel-perfect HTML/CSS replica using your EXACT brand colors & fonts.</p>
        <p className="text-sm text-gray-500 mb-2">Just take a screenshot of the poster below!</p>
      </div>

      {/* INSTAGRAM PORTRAIT POSTER (1080x1350 ratio) */}
      <div 
        className="relative bg-ivory shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "800px", height: "1000px" }}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cream rounded-bl-[100%] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cream rounded-tr-[100%] opacity-50"></div>

        <div className="relative z-10 flex flex-col h-full p-12">
          
          {/* Header */}
          <div className="text-center mt-6">
            <p className="text-[14px] uppercase tracking-[0.3em] text-gold-dark mb-4">
              Habiba Minhas
            </p>
            <h1 className="text-7xl font-display text-ink mb-2 leading-none">
              EID <span className="text-gold-dark">🌙</span>
            </h1>
            <h2 className="text-6xl font-display italic text-rose mb-6">
              Giveaway
            </h2>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-border-soft"></div>
              <p className="text-[16px] uppercase tracking-[0.4em] text-ink-soft">Alert</p>
              <div className="h-px w-12 bg-border-soft"></div>
            </div>
            <p className="text-[18px] text-ink-soft">
              Celebrate Eid in style with Habiba Minhas ♡
            </p>
          </div>

          {/* Main Prize Box */}
          <div className="mt-8 border border-gold-dark/30 bg-gold-light/40 rounded-lg p-6 mx-8 text-center flex items-center justify-center gap-6">
            <div className="w-12 h-12 rounded-full bg-gold-dark/20 flex items-center justify-center text-gold-dark text-2xl">
              🎁
            </div>
            <div className="text-left">
              <p className="text-[14px] uppercase tracking-wider text-ink">3 Lucky winners will each win</p>
              <p className="text-[18px] font-semibold text-gold-dark">THEIR FAVORITE OUTFIT FOR EID! ✨</p>
            </div>
          </div>

          {/* Dates Row */}
          <div className="flex justify-center gap-12 mt-8 mx-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose">
                📅
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted">Contest Ends</p>
                <p className="text-[16px] font-semibold text-ink">20TH MAY</p>
              </div>
            </div>
            <div className="w-px h-12 bg-border-soft"></div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center text-sage">
                📢
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted">Winners Announced</p>
                <p className="text-[16px] font-semibold text-ink">21ST MAY</p>
              </div>
            </div>
          </div>

          {/* Content Split: Rules & Images */}
          <div className="flex flex-1 mt-10">
            
            {/* Rules */}
            <div className="w-1/2 pr-6">
              <div className="bg-sage/10 text-sage px-4 py-2 inline-block rounded text-[12px] uppercase tracking-wider font-semibold mb-6">
                How to enter:
              </div>
              
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-ink text-ivory flex items-center justify-center text-[12px] shrink-0 mt-0.5">1</div>
                  <p className="text-[15px] text-ink-soft">Follow <strong>@habibaminhas.official</strong></p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-ink text-ivory flex items-center justify-center text-[12px] shrink-0 mt-0.5">2</div>
                  <p className="text-[15px] text-ink-soft">Like this post ❤️</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-ink text-ivory flex items-center justify-center text-[12px] shrink-0 mt-0.5">3</div>
                  <p className="text-[15px] text-ink-soft">Tag 2 friends in the comments 👯‍♀️</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-ink text-ivory flex items-center justify-center text-[12px] shrink-0 mt-0.5">4</div>
                  <p className="text-[15px] text-ink-soft">Share this post on your story & tag us for a bonus entry ✨</p>
                </li>
              </ul>

              <div className="mt-8 border-l-2 border-gold-dark pl-4 text-[13px] text-muted space-y-2">
                <p>✦ More comments = more chances</p>
                <p>✦ 3 winners selected randomly</p>
                <p>✦ Fake/spam accounts disqualified</p>
              </div>
            </div>

            {/* Images simulating the rack */}
            <div className="w-1/2 relative">
              <div className="absolute right-0 top-0 w-48 h-64 rounded-t-full overflow-hidden border-4 border-ivory shadow-lift z-10 rotate-3 transition-transform hover:rotate-0 duration-500">
                <Image src="/trending/sage-bloom.webp" alt="Sage Dress" fill className="object-cover" />
              </div>
              <div className="absolute right-16 top-16 w-48 h-64 rounded-t-full overflow-hidden border-4 border-ivory shadow-lift z-20 -rotate-3 transition-transform hover:rotate-0 duration-500">
                <Image src="/trending/pink-blossom.webp" alt="Pink Dress" fill className="object-cover" />
              </div>
              <div className="absolute right-32 top-32 w-48 h-64 rounded-t-full overflow-hidden border-4 border-ivory shadow-lift z-30 rotate-6 transition-transform hover:rotate-0 duration-500">
                <Image src="/trending/emerald-embroidery.webp" alt="Emerald Dress" fill className="object-cover" />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 text-center border-t border-border-soft">
            <p className="text-[18px] font-display italic text-ink mb-1">
              May your Eid be filled with elegance, joy & beautiful outfits 🌙✨
            </p>
            <p className="text-[12px] uppercase tracking-widest text-muted mt-4">
              www.habibaminhas.com
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
