import type { Metadata } from "next";
import StimaFlow from "@/components/scuole/stima/StimaFlow";

export const metadata: Metadata = {
  title: "Meridiana — La stima preliminare",
  description:
    "Pochi dati, un primo ordine di grandezza: la stima preliminare del fotovoltaico per la tua scuola.",
};

// Level-1 public estimate. App-like simulator language inside the Meridiana
// brand: cream page, white cards with soft shadow, Inter everywhere — the
// page H1 in Newsreader serif is the only bridge to the editorial site.
export default function StimaPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15]">
            La stima preliminare
          </h1>
          <p className="font-sans text-base md:text-lg text-meridiana-text-secondary leading-relaxed mt-3">
            Pochi dati, un primo ordine di grandezza. Riferisciti a un singolo
            edificio scolastico.
          </p>
        </header>
        <StimaFlow />
      </div>
    </div>
  );
}
