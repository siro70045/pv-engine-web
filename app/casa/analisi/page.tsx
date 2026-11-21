import type { Metadata } from "next";
import AnalisiCasaForm from "@/components/casa/analisi/AnalisiCasaForm";

export const metadata: Metadata = {
  title: "Meridiana — Analisi completa per la tua casa",
  description:
    "Richiedi l'analisi completa del fotovoltaico per la tua casa: tetto reale, ombre, consumi dalla bolletta e verifica dei preventivi.",
  robots: { index: false }, // skeleton: not public until the privacy notice is approved
};

export default function CasaAnalisiPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15]">
            L&apos;analisi completa per la tua casa
          </h1>
          <p className="font-sans text-base md:text-lg text-meridiana-text-secondary leading-relaxed mt-3">
            Con i dati veri della tua casa, i numeri diventano molto più
            precisi. Controllo personalmente ogni richiesta prima di
            risponderti.
          </p>
        </header>
        <AnalisiCasaForm />
      </div>
    </div>
  );
}
