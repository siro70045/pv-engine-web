import type { Metadata } from "next";
import CasaStimaFlow from "@/components/casa/stima/CasaStimaFlow";

export const metadata: Metadata = {
  title: "Meridiana — Stima per la tua casa",
  description:
    "Pochi dati, un primo ordine di grandezza: la stima preliminare del fotovoltaico residenziale.",
};

export default function CasaStimaPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15]">
            La stima per la tua casa
          </h1>
          <p className="font-sans text-base md:text-lg text-meridiana-text-secondary leading-relaxed mt-3">
            Pochi dati, un primo ordine di grandezza. Rispondi alle domande man
            mano che appaiono.
          </p>
        </header>
        <CasaStimaFlow />
      </div>
    </div>
  );
}
