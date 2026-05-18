import styles from "./IntroSection.module.css";

export default function IntroSection() {
  return (
    <section className="bg-meridiana-cream py-24 md:py-32 px-6">
      {/* Very light continuous scroll parallax on the whole text
          block (eyebrow + title + body move together). translateY
          only — does not affect the max-w / mx-auto centering or
          layout flow. See IntroSection.module.css. */}
      <div className={`max-w-3xl mx-auto text-center ${styles.parallaxText}`}>
        {/* Eyebrow */}
        <p className="text-meridiana-yellow text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-8">
          Cosa fa Meridiana
        </p>

        {/* Title */}
        <h2 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15] mb-10">
          Una risposta seria sul fotovoltaico, finalmente.
        </h2>

        {/* Body */}
        <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed max-w-2xl mx-auto">
          Meridiana usa dati climatici certificati, modelli fisici precisi e una conoscenza profonda degli incentivi italiani per dirti — con numeri veri e chiari — se l&apos;investimento ha senso per te. Offre report di analisi, non installazioni.
        </p>
      </div>
    </section>
  );
}
