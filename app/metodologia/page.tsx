import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meridiana — Metodologia",
  description:
    "Come Meridiana calcola le sue stime: dati solari PVGIS, simulazione ora per ora, codice e audit pubblici.",
};

const ENGINE_REPO = "https://github.com/siro70045/pv-engine";

// Minimal methodology page. Content to be expanded later; for now it states
// the three facts a reader needs to trust the numbers: where the data comes
// from, what the engine computes, and where to check it.
export default function MetodologiaPage() {
  return (
    <section className="px-6 py-24 lg:py-32">
      <div className="max-w-2xl mx-auto">
        <p className="text-meridiana-yellow font-bold text-sm uppercase tracking-[0.15em] mb-6">
          Metodologia
        </p>
        <h1 className="font-serif text-4xl md:text-6xl text-meridiana-black leading-[1.15] mb-12">
          Come calcoliamo i numeri
        </h1>

        <div className="space-y-10 text-lg text-meridiana-text-secondary leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-meridiana-black mb-3">
              I dati
            </h2>
            <p>
              Sole e temperature vengono da PVGIS, lo strumento pubblico della
              Commissione Europea: un anno meteo tipico, ora per ora, per il
              punto in cui si trova l&apos;edificio.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-meridiana-black mb-3">
              Il calcolo
            </h2>
            <p>
              Il motore simula l&apos;impianto ora per ora per un anno intero:
              quanta energia produce, quanta ne consumi nel momento in cui viene
              prodotta e quanta va in rete. Da lì ricava costo, detrazione e
              tempo di rientro.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-meridiana-black mb-3">
              Verificabile
            </h2>
            <p>
              Il codice del motore è pubblico, insieme alla documentazione e a
              un audit matematico dei calcoli.{" "}
              <a
                href={ENGINE_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-meridiana-black underline underline-offset-4 decoration-meridiana-yellow hover:text-meridiana-yellow-hover"
              >
                Vedi il codice su GitHub →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
