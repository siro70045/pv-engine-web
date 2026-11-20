import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meridiana — Casa",
  description:
    "Scopri se conviene installare il fotovoltaico sulla tua casa: produzione, investimento e tempo di rientro in pochi minuti.",
};

// Entry page for the residential segment. Same centered layout as the
// former "coming soon" placeholder, but the CTA now leads to the live
// estimator at /casa/stima (button style matches components/scuole/CtaStima).
export default function CasaPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-2xl">
        <h1 className="font-serif text-4xl md:text-6xl text-meridiana-black leading-[1.15] mb-8">
          Vale la pena installare i pannelli sulla tua casa?
        </h1>
        <p className="text-meridiana-text-secondary text-lg leading-relaxed mb-10">
          In pochi minuti scopri quanta parte della bolletta copriresti, quanto
          costerebbe l&apos;impianto e in quanti anni recuperi la spesa.
          Teniamo conto della tua bolletta, delle tue abitudini, delle
          caratteristiche della tua casa e della detrazione IRPEF.
        </p>
        <a
          href="/casa/stima"
          className="inline-block bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black font-semibold text-base md:text-lg px-8 py-4 rounded-full shadow-sm transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md"
        >
          Avvia una stima preliminare →
        </a>
      </div>
    </section>
  );
}
