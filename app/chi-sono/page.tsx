import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Meridiana — Chi sono",
  description:
    "Nicola, 19 anni, provincia di Reggio Emilia: perché ho costruito Meridiana e come funziona.",
};

const CONTACT_EMAIL = "nicola.sirotti.07@gmail.com";
const ENGINE_REPO = "https://github.com/siro70045/pv-engine";

// iOS-style "inset grouped" layout: a centered profile header, then
// sections made of a small uppercase label above a white rounded card,
// and a final grouped list of tappable rows with chevrons (like Settings).
// Sans-only on purpose, unlike the serif editorial pages.

interface Sezione {
  label: string;
  body: string;
}

const sezioni: Sezione[] = [
  {
    label: "Perché Meridiana",
    body: "Conversando in famiglia mi sono reso conto di quanto fosse difficile capire se un preventivo per la casa fosse giusto. Chi deve decidere se spendere 8–15 mila euro in pannelli ha in mano quasi solo i numeri di chi glieli vende. Ritengo che con la matematica si possano semplificare queste decisioni: Meridiana vuole dare una risposta indipendente, anche quando la risposta è “non conviene”.",
  },
  {
    label: "Da dove arriva",
    body: "La prima versione era pensata per le scuole e l’ho presentata alla sindaca di Albinea. È stato il suo consiglio a portarla verso i cittadini.",
  },
  {
    label: "Come è fatta",
    body: "I dati solari vengono da PVGIS, lo strumento pubblico della Commissione Europea. Il codice, dopo aver studiato e interpretato la fisica coinvolta, lo scrivo con l’aiuto dell’intelligenza artificiale; io decido cosa calcolare e verifico che i numeri tornino. Il motore è pubblico su GitHub, insieme a un audit matematico che ho fatto sui miei stessi conti. Sto continuando a migliorare e perfezionare l’algoritmo di calcolo.",
  },
  {
    label: "Cosa non faccio",
    body: "Nessuna commissione dagli installatori e nessuna vendita dei tuoi dati.",
  },
];

interface Riga {
  titolo: string;
  dettaglio: string;
  href: string;
  esterno: boolean;
}

const righe: Riga[] = [
  {
    titolo: "Scrivimi",
    dettaglio: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    esterno: false,
  },
  {
    titolo: "Il codice su GitHub",
    dettaglio: "pv-engine",
    href: ENGINE_REPO,
    esterno: true,
  },
  {
    titolo: "Prova la stima per la casa",
    dettaglio: "Gratis",
    href: "/casa/stima",
    esterno: false,
  },
];

export default function ChiSonoPage() {
  return (
    <section className="px-5 py-16 md:py-24 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-[0_8px_30px_rgba(26,22,18,0.12)] ring-4 ring-white mb-6">
            <Image
              src="/images/chi-sono/nicola.jpg"
              alt="Foto di Nicola, fondatore di Meridiana"
              fill
              sizes="144px"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight text-meridiana-black">
            Ciao, sono Nicola.
          </h1>
          <p className="mt-4 text-base md:text-lg text-meridiana-text-secondary leading-relaxed">
            Ho 19 anni e vivo in provincia di Reggio Emilia. Nel 2026 ho
            iniziato a costruire Meridiana, mentre mi diplomavo al liceo
            scientifico; l&apos;anno prossimo inizierò a studiare matematica
            all&apos;università.
          </p>
        </div>

        {/* Inset grouped sections */}
        <div className="space-y-8">
          {sezioni.map((s) => (
            <div key={s.label}>
              <p className="px-4 mb-2 text-xs font-medium uppercase tracking-wider text-meridiana-text-tertiary">
                {s.label}
              </p>
              <div className="bg-white rounded-2xl px-5 py-4 shadow-[0_1px_3px_rgba(26,22,18,0.06)]">
                <p className="text-[15px] md:text-base text-meridiana-black/85 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </div>
          ))}

          {/* Grouped list with chevrons */}
          <div>
            <p className="px-4 mb-2 text-xs font-medium uppercase tracking-wider text-meridiana-text-tertiary">
              Contatti
            </p>
            <ul className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(26,22,18,0.06)] divide-y divide-meridiana-border-light">
              {righe.map((r) => (
                <li key={r.titolo}>
                  <a
                    href={r.href}
                    {...(r.esterno
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex items-center justify-between gap-4 min-h-12 px-5 py-3 transition-colors hover:bg-meridiana-cream-light active:bg-meridiana-cream"
                  >
                    <span className="text-[15px] md:text-base text-meridiana-black">
                      {r.titolo}
                    </span>
                    <span className="flex items-center gap-2 min-w-0 text-sm text-meridiana-text-tertiary">
                      <span className="truncate">{r.dettaglio}</span>
                      <span aria-hidden="true" className="text-lg leading-none">
                        ›
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
