import Reveal from "./Reveal";

// "Calibrato per le scuole" — intro paragraph + three stacked sub-blocks
// (calendario / occupazione / consumo). Stacked vertically rather than a
// 3-col grid to keep the magazine voice consistent with the rest of the site.
export default function CalibratoScuole() {
  const blocchi = [
    {
      titolo: "Il calendario.",
      testo:
        "Ogni regione italiana ha date di inizio e fine scuola, festività, sospensioni didattiche diverse. Meridiana usa il calendario reale di tutte e ventuno le regioni: una scuola in Sicilia ha tre mesi di estate vuota, una in Lombardia poco meno.",
    },
    {
      titolo: "L'occupazione.",
      testo:
        "Le aule vivono la mattina, gli uffici amministrativi tutto il giorno, la palestra ha ritmi propri. Meridiana distingue queste zone e calcola i consumi in modo coerente con l'uso reale dell'edificio.",
    },
    {
      titolo: "Il consumo.",
      testo:
        "I benchmark ENEA per gli edifici scolastici tengono conto del riscaldamento invernale con classi piene, di un raffrescamento estivo quasi assente, di un'illuminazione concentrata nelle ore di lezione. Meridiana parte da questi dati reali, non da un edificio medio generico.",
    },
  ];

  return (
    <section
      id="calibrato-scuole"
      className="scroll-mt-20 bg-meridiana-cream py-20 lg:py-32 px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Eyebrow */}
        <Reveal>
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6 text-center">
            Pensato in modo specifico
          </p>
        </Reveal>

        {/* Title */}
        <Reveal delay={100}>
          <h2 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15] mb-10 text-center">
            Calibrato per le scuole
          </h2>
        </Reveal>

        {/* Intro */}
        <Reveal delay={200}>
          <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed text-center max-w-2xl mx-auto mb-16">
            Una scuola non è una casa né un&apos;azienda. Meridiana lo sa, e
            adatta ogni simulazione a tre specificità del mondo scolastico, oltre
            che alle singole caratteristiche di utilizzo dell&apos;edificio.
          </p>
        </Reveal>

        {/* Sub-blocks — each reveals as it scrolls into view */}
        <div className="space-y-12 lg:space-y-16">
          {blocchi.map((blocco) => (
            <Reveal key={blocco.titolo}>
              <h3 className="font-serif text-xl md:text-2xl text-meridiana-black font-semibold mb-3">
                {blocco.titolo}
              </h3>
              <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed">
                {blocco.testo}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
