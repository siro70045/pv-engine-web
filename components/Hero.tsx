import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] md:h-[700px] overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero-borgo.jpg"
        alt="Borgo italiano al tramonto"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/15" />

      {/* Content layer */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            — Analisi tecno-economica · Italia
          </p>

          {/* Title with italic */}
          <h1 className="font-serif text-5xl md:text-7xl text-meridiana-cream font-semibold leading-[1.05] mb-8">
            Misura <em className="italic font-normal">il sole</em> che si posa sul tuo edificio.
          </h1>

          {/* Subtitle */}
          <p className="text-meridiana-cream/85 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            Meridiana calcola se il fotovoltaico ha senso per la tua casa, la tua scuola o la tua azienda. Numeri reali, dati certificati, risposta onesta — anche quando è no.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <a
              href="/simulatore"
              className="inline-flex items-center bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black font-semibold text-base px-7 py-4 rounded-full transition-colors"
            >
              Avvia il simulatore →
            </a>
            <a
              href="#come-funziona"
              className="text-meridiana-cream/90 hover:text-meridiana-cream text-base underline underline-offset-4 decoration-meridiana-cream/30 hover:decoration-meridiana-cream"
            >
              Scopri come funziona ↓
            </a>
          </div>

          {/* Disclaimer line */}
          <p className="text-meridiana-cream/60 text-sm">
            Gratuito · Nessuna registrazione · Risultato in 5 minuti
          </p>
        </div>
      </div>

      {/* Glass banner 1 — Scuola */}
      <div className="hidden md:block absolute top-12 right-12 w-72 bg-meridiana-black/85 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl p-6 z-10">
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
      <div className="hidden lg:block absolute top-1/2 right-12 -translate-y-1/2 w-64 bg-meridiana-black/85 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl p-6 z-10">
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
      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 w-80 bg-meridiana-black/85 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl p-6 z-10">
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
          520.000 <span className="text-base font-normal text-meridiana-cream/60">kWh totali</span>
        </p>
      </div>
    </section>
  );
}
