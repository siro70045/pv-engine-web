import Reveal from "./Reveal";

// Final CTA block for /scuole — invites the reader toward a preliminary
// estimate. Sits on cream-elevated (the lightest cream) to lift it off the
// cream "Calibrato per le scuole" section above, keeping the solid-yellow
// button as the page's closing focal point. Wrapped in Reveal so it shares
// the same progressive-enhancement entry fade as the other sections.
export default function CtaStima() {
  return (
    <section
      id="cta-stima"
      className="scroll-mt-20 bg-meridiana-cream-elevated py-20 lg:py-32 px-6"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Title */}
        <Reveal>
          <h2 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15] mb-6">
            Quanto sole si posa sulla tua scuola?
          </h2>
        </Reveal>

        {/* Body */}
        <Reveal delay={100}>
          <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed mb-10 max-w-xl mx-auto">
            Inizia con una stima preliminare. Quando vorrai certezze da portare
            in delibera, prepareremo insieme il report completo.
          </p>
        </Reveal>

        {/* CTA button — solid yellow, focal point, ≥44px tap target */}
        <Reveal delay={200}>
          <a
            href="/scuole/stima"
            className="inline-block bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black font-semibold text-base md:text-lg px-8 py-4 rounded-full shadow-sm transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md"
          >
            Avvia una stima preliminare →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
