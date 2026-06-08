import Reveal from "./Reveal";

// Intro for /scuole. Same editorial layout as the home IntroSection
// (centered prose, generous vertical padding), followed by three
// navigator buttons that smooth-scroll to the sections below.
// Body typography intentionally matches the home IntroSection body
// (Inter sans, text-base md:text-lg, leading-relaxed) — it reads as
// running text, not a heading.
export default function IntroScuole() {
  const navigators = [
    { label: "Come funziona", href: "#come-funziona" },
    { label: "Il programma educativo", href: "#programma-educativo" },
    { label: "Calibrato per le scuole", href: "#calibrato-scuole" },
  ];

  return (
    <section className="bg-meridiana-cream py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Body — same classes as the home IntroSection body */}
        <Reveal>
          <p className="text-base md:text-lg text-meridiana-text-secondary leading-relaxed max-w-2xl mx-auto">
            Meridiana calcola onestamente quanto un impianto fotovoltaico può
            rendere alla tua scuola. Ma i numeri non bastano. Insieme alla
            simulazione proponiamo un programma educativo per portare la
            sostenibilità dentro le aule, con i bambini come protagonisti.
          </p>
        </Reveal>

        {/* Yellow call-out line */}
        <Reveal delay={100}>
          <p className="text-meridiana-yellow font-semibold text-base md:text-lg mt-8">
            Scopri di più in questa pagina.
          </p>
        </Reveal>

        {/* Three navigator buttons */}
        <Reveal delay={200}>
          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {navigators.map((nav) => (
              <a
                key={nav.href}
                href={nav.href}
                className="group flex min-h-[100px] items-center justify-center rounded-xl border border-meridiana-black/15 px-6 py-8 text-center font-sans font-semibold text-base md:text-lg text-meridiana-text-secondary transition-all duration-300 ease-out hover:scale-[1.03] hover:border-meridiana-yellow hover:text-meridiana-yellow"
              >
                {nav.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
