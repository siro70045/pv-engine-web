import PerChiCard from "@/components/PerChiCard";

interface PerChiVoce {
  numero: "1" | "2" | "3";
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
    numero: "1",
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
    numero: "2",
    stato: "Già attivo.",
    statoTipo: "attivo",
    titolo: "Non è solo energia per le scuole.",
    corpo:
      "Meridiana è già operativa per le scuole, con profili specifici per il tuo istituto, calendari regionali, incentivi. Non ti dirà solo se conviene o no montare un impianto. Meridiana include attività didattiche collegate al curricolo, volte all'educazione alla sostenibilità dei bambini.",
    imageSrc: "/images/per-chi/scuola.png",
    imageAlt: "Illustrazione isometrica di una scuola con impianto fotovoltaico",
    href: "/scuole",
    orientamento: "illo-right",
  },
  {
    numero: "3",
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
    <section className="bg-meridiana-cream py-20 lg:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 lg:mb-16">
          <p className="text-meridiana-yellow font-bold text-base mb-2">
            Magari fa al caso tuo.
          </p>
          <p className="text-meridiana-text-secondary text-lg">
            Case / Scuole / Aziende
          </p>
        </div>

        {/* Editorial zig-zag blocks */}
        <div className="divide-y divide-meridiana-border-light">
          {voci.map((voce) => (
            <PerChiCard key={voce.numero} {...voce} />
          ))}
        </div>
      </div>
    </section>
  );
}
