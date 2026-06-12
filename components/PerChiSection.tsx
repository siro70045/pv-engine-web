import PerChiCard from "@/components/PerChiCard";

interface PerChiVoce {
  stato: string;
  statoTipo: "attivo" | "arrivo";
  titolo: string;
  corpo: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  orientamento: "illo-left" | "illo-right";
}

const voci: PerChiVoce[] = [
  {
    stato: "IN ARRIVO – Inverno 2026",
    statoTipo: "arrivo",
    titolo: "Vale la pena installare i pannelli sulla tua casa?",
    corpo:
      "In 5 minuti scopri quanto produrresti, quanto risparmieresti, in quanti anni recuperi l'investimento, tutto grazie a numeri e grafici chiari. Teniamo conto delle tue abitudini, della tua bolletta, delle caratteristiche della tua casa, delle detrazioni IRPEF.",
    imageSrc: "/images/per-chi/casa.png",
    imageAlt: "Illustrazione isometrica di una casa con impianto fotovoltaico",
    href: "/casa",
    orientamento: "illo-left",
  },
  {
    stato: "GIÀ ATTIVO - Estate 2026",
    statoTipo: "attivo",
    titolo: "Non è solo energia per le scuole.",
    corpo:
      "Meridiana è già operativa per le scuole, con profili specifici per il tuo istituto, calendari regionali, incentivi. Non ti dirà solo se conviene o no montare un impianto: includerà attività didattiche collegate al curricolo, volte all'educazione alla sostenibilità dei bambini.",
    imageSrc: "/images/per-chi/scuola.png",
    imageAlt: "Illustrazione isometrica di una scuola con impianto fotovoltaico",
    href: "/scuole",
    orientamento: "illo-right",
  },
  {
    stato: "IN ARRIVO – Primavera 2027",
    statoTipo: "arrivo",
    titolo: "Capannoni, uffici, attività commerciali.",
    corpo:
      "I numeri più alti del mercato sono qui: autoconsumo elevato, incentivi Transizione 5.0, ammortamento accelerato, possibilità di Comunità Energetica. Meridiana calcola con il rigore che il tuo CFO si aspetta, per dirti se il fotovoltaico può essere opportunità di risparmio.",
    imageSrc: "/images/per-chi/azienda.png",
    imageAlt:
      "Illustrazione isometrica di un complesso industriale con impianto fotovoltaico",
    href: "/aziende",
    orientamento: "illo-left",
  },
];

export default function PerChiSection() {
  return (
    <section className="bg-meridiana-cream pt-12 lg:pt-16 pb-20 lg:pb-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header — deliberately tight pt above + small
            section padding-top so the eyebrow reads as a
            continuation of IntroSection, then a generous mb
            below to detach the header from the Casa/Scuole/Aziende
            blocks ("narration continues → pause → enumeration"). */}
        <div className="text-center mb-24 lg:mb-32">
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-2">
            Magari fa al caso tuo
          </p>
          <p className="text-meridiana-text-secondary text-lg">
            Per case, scuole, aziende.
          </p>
        </div>

        {/* Editorial zig-zag blocks */}
        <div className="divide-y divide-meridiana-border-light">
          {voci.map((voce) => (
            <PerChiCard key={voce.href} {...voce} />
          ))}
        </div>
      </div>
    </section>
  );
}
