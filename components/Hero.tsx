import Image from "next/image";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[720px] md:h-[780px] overflow-hidden">
      {/* Background image — wrapped for a noticeable scroll parallax.
          The transform is on this wrapper div (NOT the <Image>, whose
          internal <img> would not pick up the class). Driven by
          scroll(root) over the first 780px of page scroll — view()
          was wrong here because the Hero is above the fold. The
          wrapper overscans the section by 60px top/bottom so the
          ±38px translate never reveals an edge under the navbar / fades
          (overflow-hidden on the section clips the overscan). Only this
          photo moves; overlay, fades, SVG lines and banners stay static.
          See Hero.module.css. */}
      <div className={styles.heroPhoto}>
        <Image
          src="/hero-borgo.jpg"
          alt="Borgo italiano al tramonto"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/15" />

      {/* Top fade — softens transition with navbar */}
      <div
        className="absolute top-0 left-0 right-0 h-4 md:h-6 bg-gradient-to-b from-meridiana-cream/70 via-meridiana-cream/20 to-transparent pointer-events-none z-[5]"
      />

      {/* Bottom fade — softens transition into IntroSection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 md:h-6 bg-gradient-to-t from-meridiana-cream via-meridiana-cream/30 to-transparent pointer-events-none z-[5]"
      />

      {/* Content layer */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            — Analisi tecnico-economica · Italia
          </p>

          {/* Title with italic */}
          <h1 className="font-serif text-5xl md:text-7xl text-meridiana-cream font-semibold leading-[1.05] mb-8">
            Misura <em className="italic font-normal">il sole</em> che si posa sul tuo edificio.
          </h1>

          {/* Subtitle + inline "Scopri come funziona" */}
          <p className="text-meridiana-cream/85 text-base md:text-lg leading-relaxed max-w-xl">
            Meridiana calcola se il fotovoltaico ha senso per la tua casa, la tua scuola o la tua azienda. Offre una stima tecnico-economica e una risposta onesta — anche quando è no.{" "}
            <a
              href="#come-funziona"
              className="text-meridiana-cream hover:text-meridiana-yellow underline underline-offset-4 decoration-meridiana-cream/40 hover:decoration-meridiana-yellow transition-colors whitespace-nowrap"
            >
              Scopri come funziona ↓
            </a>
          </p>
        </div>
      </div>

      {/* Glass banner 1 — Scuola */}
      <div className="hidden md:block absolute top-12 right-12 w-72 group cursor-default bg-meridiana-black/85 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl p-6 z-10 transition-all duration-300 ease-out hover:bg-meridiana-black/75 hover:backdrop-blur-2xl hover:backdrop-saturate-200 hover:border-white/20 hover:scale-[1.04] origin-right hover:shadow-2xl hover:shadow-black/40">
        <p className="text-meridiana-yellow text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">
          Scuola · 3.000 m²
        </p>
        <p className="text-meridiana-cream text-3xl font-semibold mb-1 font-sans">
          +€11.200<span className="text-base font-normal text-meridiana-cream/60">/anno</span>
        </p>
        <p className="text-meridiana-cream/60 text-sm">
          5,8 anni di rientro
        </p>
      </div>

      {/* Glass banner 2 — Casa */}
      <div className="hidden lg:block absolute top-1/2 right-12 -translate-y-1/2 w-64 group cursor-default bg-meridiana-black/85 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl p-6 z-10 transition-all duration-300 ease-out hover:bg-meridiana-black/75 hover:backdrop-blur-2xl hover:backdrop-saturate-200 hover:border-white/20 hover:scale-[1.04] origin-right hover:shadow-2xl hover:shadow-black/40">
        <p className="text-meridiana-yellow text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">
          Casa · 180 m²
        </p>
        <p className="text-meridiana-cream text-3xl font-semibold mb-1 font-sans">
          +€2.300<span className="text-base font-normal text-meridiana-cream/60">/anno</span>
        </p>
        <p className="text-meridiana-cream/60 text-sm">
          24 kWp installabili
        </p>
      </div>

      {/* Glass banner 3 — Produzione mensile (con curva SVG) */}
      <div className="hidden md:block absolute bottom-12 right-12 w-80 group cursor-default bg-meridiana-black/85 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl p-6 z-10 transition-all duration-300 ease-out hover:bg-meridiana-black/75 hover:backdrop-blur-2xl hover:backdrop-saturate-200 hover:border-white/20 hover:scale-[1.04] origin-right hover:shadow-2xl hover:shadow-black/40">
        <p className="text-meridiana-yellow text-[10px] font-semibold tracking-[0.2em] uppercase mb-3">
          Produzione mensile
        </p>
        {/* Mini SVG curve */}
        <svg viewBox="0 0 240 60" className="w-full h-12 mb-3" preserveAspectRatio="none">
          <path
            d="M 0 50 Q 30 45, 60 35 T 120 15 T 180 25 T 240 45"
            fill="none"
            stroke="#E8B547"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-meridiana-cream text-2xl font-semibold font-sans">
          120.000 <span className="text-base font-normal text-meridiana-cream/60">kWh totali</span>
        </p>
      </div>

      {/* Connection lines: banners → buildings */}
      <svg
        className="hidden md:block absolute right-0 top-0 h-full w-[700px] pointer-events-none z-[8]"
        viewBox="0 0 700 1000"
        preserveAspectRatio="none"
      >
        {/* Line 1: Scuola → edificio scuola (banner left-bottom → building below-left) */}
        <line
          x1="360" y1="140"
          x2="550" y2="340"
          stroke="#E8B547"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle cx="550" cy="340" r="3" fill="#E8B547" opacity="0.7" />

        {/* Line 2: Casa → cluster case (banner left → houses below-left) */}
        <line
          x1="390" y1="520"
          x2="460" y2="680"
          stroke="#E8B547"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle cx="460" cy="680" r="3" fill="#E8B547" opacity="0.7" />

        {/* Line 3: Produzione → edificio basso-sinistra */}
        <line
          x1="325" y1="870"
          x2="100" y2="820"
          stroke="#E8B547"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle cx="100" cy="820" r="3" fill="#E8B547" opacity="0.7" />
      </svg>
    </section>
  );
}
