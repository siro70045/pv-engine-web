import Reveal from "./Reveal";

// "Il programma educativo" — three editorial paragraphs on the schools
// outreach programme. Warm-white background (cream-elevated) for visual
// separation from the steps above. No image placeholder for now
// (decision: add the real classroom photo later).
export default function ProgrammaEducativo() {
  return (
    <section
      id="programma-educativo"
      className="scroll-mt-20 bg-meridiana-cream-elevated py-20 lg:py-32 px-6"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <Reveal>
          <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            In arrivo – Autunno 2026
          </p>
        </Reveal>

        {/* Title */}
        <Reveal delay={100}>
          <h2 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15] mb-12">
            Il programma educativo.
          </h2>
        </Reveal>

        {/* Paragraphs */}
        <Reveal delay={200} className="space-y-6 text-left">
          <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed">
            Meridiana è anche un progetto educativo. A ogni scuola che ci
            accompagna proponiamo un percorso di attività pensato per portare il
            tema della sostenibilità dentro le aule, con i bambini come
            protagonisti.
          </p>
          <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed">
            Non si tratta di una lezione in più, ma di un modo per far entrare il
            sole — quello che si posa sul tetto dell&apos;edificio scolastico —
            anche nei pensieri di chi ci studia. Ciascuna attività si lega
            perfettamente al curricolo e alle indicazioni nazionali; in questo
            modo il sole e la sostenibilità arricchiscono la strada educativa dei
            bambini.
          </p>
          <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed">
            I dettagli del programma saranno definiti insieme alle scuole, in
            dialogo con dirigenti, insegnanti e famiglie.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
