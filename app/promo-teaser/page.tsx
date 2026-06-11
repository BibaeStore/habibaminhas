import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeaserPromoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8 font-sans">
      <div className="text-center mb-8 absolute top-8 left-8">
        <p className="text-sm text-gray-500 mb-2">Here is a pre-launch teaser poster!</p>
        <p className="text-sm text-gray-500 mb-2">Visit https://habibaminhas.com/promo-teaser to view and screenshot.</p>
      </div>

      {/* INSTAGRAM PORTRAIT POSTER (1080x1350 ratio) */}
      <div 
        className="relative bg-ink shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "800px", height: "1000px" }}
      >
        {/* Background Texture / Subtle Glow */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gold-dark rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>

        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          
          {/* Header */}
          <div className="text-center mt-12 animate-fade-up">
            <p className="text-[12px] uppercase tracking-[0.4em] text-gold mb-6">
              A New Era of Elegance
            </p>
            <h1 className="text-6xl font-display text-ivory mb-4 leading-tight">
              Something beautiful <br/>
              <span className="italic text-gold-dark">is blooming.</span>
            </h1>
          </div>

          {/* Moodboard / Sneak Peek Images */}
          <div className="relative h-[400px] w-full mt-8 flex justify-center items-center">
            {/* Center Image (Details) */}
            <div className="absolute z-30 w-64 h-80 border border-gold-dark/30 shadow-lift overflow-hidden bg-ivory p-3 rotate-[-2deg] transition-transform duration-500 hover:rotate-0 hover:z-40">
              <div className="relative w-full h-full overflow-hidden">
                <Image src="/trending/emerald-embroidery.webp" alt="Embroidery Detail" fill className="object-cover scale-150 origin-bottom" />
              </div>
            </div>
            
            {/* Left Image (Fabric) */}
            <div className="absolute z-20 left-16 top-12 w-56 h-72 border border-border-soft/20 shadow-lift overflow-hidden bg-ivory p-2 rotate-[-12deg] opacity-90 transition-transform duration-500 hover:rotate-0 hover:z-40">
              <div className="relative w-full h-full overflow-hidden filter grayscale-[30%]">
                <Image src="/trending/floral-lawn.webp" alt="Fabric Detail" fill className="object-cover scale-125 origin-top-left" />
              </div>
            </div>

            {/* Right Image (Palette) */}
            <div className="absolute z-20 right-16 bottom-4 w-56 h-72 border border-border-soft/20 shadow-lift overflow-hidden bg-ivory p-2 rotate-[8deg] opacity-90 transition-transform duration-500 hover:rotate-0 hover:z-40">
              <div className="relative w-full h-full overflow-hidden filter contrast-125 saturate-50">
                <Image src="/trending/sage-bloom.webp" alt="Palette Detail" fill className="object-cover scale-125 origin-center" />
              </div>
            </div>
          </div>

          {/* Call to Action Box */}
          <div className="mt-12 mx-auto max-w-md border border-gold-dark/40 bg-ink-soft/40 backdrop-blur-md p-8 text-center text-ivory">
            <h3 className="text-2xl font-display italic mb-3">Join the VIP Waitlist</h3>
            <p className="text-[13px] text-muted mb-6 leading-relaxed">
              Be the first to experience the inaugural collection. Exclusive early access and launch-day privileges await.
            </p>
            <div className="inline-block border border-gold-dark px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-gold-dark hover:text-ink transition-colors cursor-pointer">
              Link in Bio
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-4 mt-8">
            <p className="text-[16px] font-display uppercase tracking-[0.2em] text-ivory/80">
              Habiba Minhas
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted mt-3">
              Arriving Soon • Eid 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
