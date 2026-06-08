import Image from "next/image";

// Page-specific hero for /scuole. Mirrors the home Hero's dramatic
// full-bleed photo + dark overlay + soft fades, but deliberately omits
// the glass banners and SVG connection lines: those signal "entrance to
// the site" and belong only on the homepage. Here the headline carries
// the section on its own, centered over the image.
export default function HeroScuole() {
  return (
    <section className="relative w-full h-[78vh] min-h-[560px] md:h-[640px] overflow-hidden">
      <Image
        src="/images/scuole/sfondo_hero.jpg"
        alt="Bambino disegna fiori e soli con i pastelli su un foglio"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />

      {/* Dark overlay for headline readability — symmetric (centered text) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/55" />

      {/* Top fade — softens transition with navbar */}
      <div className="absolute top-0 left-0 right-0 h-4 md:h-6 bg-gradient-to-b from-meridiana-cream/70 via-meridiana-cream/20 to-transparent pointer-events-none z-[5]" />

      {/* Bottom fade — softens transition into IntroScuole */}
      <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12 bg-gradient-to-t from-meridiana-cream via-meridiana-cream/40 to-transparent pointer-events-none z-[5]" />

      {/* Content layer */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl">
          {/* Eyebrow (facoltativo — Sirot calibra visivamente) */}
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            Pagina scuole
          </p>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-6xl text-meridiana-cream font-semibold leading-[1.08]">
            Il sole sulla scuola illumina anche chi ci studia.
          </h1>
        </div>
      </div>
    </section>
  );
}
