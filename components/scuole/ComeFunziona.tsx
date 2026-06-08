import Reveal from "./Reveal";

// "Come funziona" — four steps, each a giant serif numeral beside its
// title + description. scroll-mt offsets the sticky h-16 navbar so the
// anchor target isn't hidden when reached via the navigator buttons.
export default function ComeFunziona() {
  const steps = [
    {
      n: "01",
      titolo: "Ci dici dove sei.",
      testo:
        "Indirizzo della scuola, anno di costruzione, dimensioni approssimative. Sono le tre informazioni di partenza.",
    },
    {
      n: "02",
      titolo: "Carichiamo i dati climatici reali.",
      testo:
        "Radiazione solare oraria, gradi-giorno, temperature medie. Le fonti sono pubbliche e verificabili: PVGIS dell'Unione Europea e l'archivio storico ENEA.",
    },
    {
      n: "03",
      titolo:
        "Aggiungendo informazioni sull'utilizzo scolastico, simuliamo l'impianto.",
      testo:
        "Calcoliamo produzione fotovoltaica anno per anno, autoconsumo, scambio con la rete, costi e ricavi su venticinque anni di vita utile dell'impianto.",
    },
    {
      n: "04",
      titolo: "Ti diamo un report.",
      testo:
        "Un documento PDF che puoi scaricare, citare in delibera, condividere con chi decide. Senza account, senza vincoli.",
    },
  ];

  return (
    <section
      id="come-funziona"
      className="scroll-mt-20 bg-meridiana-cream-light py-20 lg:py-32 px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Eyebrow */}
        <Reveal>
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6 text-center">
            In 4 passaggi, nessuna registrazione
          </p>
        </Reveal>

        {/* Title */}
        <Reveal delay={100}>
          <h2 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15] mb-16 text-center">
            Come funziona?
          </h2>
        </Reveal>

        {/* Steps */}
        <Reveal delay={200} className="space-y-12 lg:space-y-16">
          {steps.map((step) => (
            <div
              key={step.n}
              className="flex flex-col lg:flex-row lg:items-start lg:gap-8"
            >
              <span className="font-serif text-6xl lg:text-7xl text-meridiana-yellow font-semibold leading-none mb-3 lg:mb-0 lg:w-28 lg:shrink-0 lg:text-right">
                {step.n}
              </span>
              <div className="lg:pt-2">
                <h3 className="font-serif text-xl md:text-2xl text-meridiana-black font-semibold mb-3 leading-snug">
                  {step.titolo}
                </h3>
                <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed">
                  {step.testo}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
