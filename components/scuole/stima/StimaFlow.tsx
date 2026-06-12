"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, postEstimate } from "@/lib/api";
import type {
  ComuneEntry,
  EstimateRequest,
  EstimateResponse,
} from "@/lib/types";
import ComuneAutocomplete, { type ComuneSelection } from "./ComuneAutocomplete";
import ErrorCard from "./ErrorCard";
import FieldCard from "./FieldCard";
import LoadingCard from "./LoadingCard";
import Pills from "./Pills";
import ResultView from "./ResultView";

// Client orchestrator for /scuole/stima: form → loading → result | error.
// The result is ephemeral (same route); "Modifica i dati" returns to the
// form with every selection preserved.

type Tipologia = EstimateRequest["tipologia"];
type FasciaStudenti = EstimateRequest["fascia_studenti"];
type FasciaAnno = EstimateRequest["fascia_anno"];

type Phase =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "result"; data: EstimateResponse }
  | { kind: "error"; message: string };

const TIPOLOGIE: { value: Tipologia; label: string }[] = [
  { value: "elementare", label: "Elementare" },
  { value: "media", label: "Media" },
  { value: "liceo", label: "Liceo" },
  { value: "tecnico_professionale", label: "Istituto tecnico-professionale" },
];

const STUDENTI: { value: FasciaStudenti; label: string }[] = [
  { value: "lt_100", label: "Meno di 100" },
  { value: "100_300", label: "100 – 300" },
  { value: "300_600", label: "300 – 600" },
  { value: "gt_600", label: "Oltre 600" },
];

const ANNI: { value: FasciaAnno; label: string }[] = [
  { value: "pre_1960", label: "Prima del 1960" },
  { value: "1960_1980", label: "1960 – 1980" },
  { value: "1980_2000", label: "1980 – 2000" },
  { value: "post_2000", label: "Dopo il 2000" },
  { value: "non_lo_so", label: "Non lo so" },
];

const POTENZE: { value: number | null; label: string }[] = [
  { value: null, label: "Non lo so — stimatela voi" },
  { value: 20, label: "Circa 20 kWp" },
  { value: 50, label: "Circa 50 kWp" },
  { value: 100, label: "Circa 100 kWp" },
  { value: 150, label: "Oltre 100 kWp" },
];

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 429)
      return "Troppe richieste ravvicinate. Riprova tra un minuto.";
    if (e.status === 503)
      return "Il servizio di calcolo è momentaneamente non disponibile. Riprova tra poco.";
    return "Non siamo riusciti a completare la stima. Riprova tra poco.";
  }
  // fetch() network failure (offline, DNS, CORS)
  return "Il servizio di calcolo è momentaneamente non disponibile. Riprova tra poco.";
}

export default function StimaFlow() {
  const [phase, setPhase] = useState<Phase>({ kind: "form" });

  // Form state — survives the result view so "Modifica i dati" restores it
  const [comune, setComune] = useState<ComuneSelection | null>(null);
  const [tipologia, setTipologia] = useState<Tipologia | null>(null);
  const [studenti, setStudenti] = useState<FasciaStudenti | null>(null);
  const [anno, setAnno] = useState<FasciaAnno>("non_lo_so");
  const [potenza, setPotenza] = useState<number | null>(null);

  // Lazy comuni dataset: fetched once at page mount, never in the bundle
  const [comuni, setComuni] = useState<ComuneEntry[] | null>(null);
  const [comuniError, setComuniError] = useState(false);
  useEffect(() => {
    fetch("/data/comuni.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setComuni)
      .catch(() => setComuniError(true));
  }, []);

  const topRef = useRef<HTMLDivElement>(null);
  function scrollToTop() {
    topRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  const canSubmit =
    comune !== null && tipologia !== null && studenti !== null;

  async function submit() {
    if (!canSubmit || !comune || !tipologia || !studenti) return;
    setPhase({ kind: "loading" });
    scrollToTop();
    try {
      const data = await postEstimate({
        comune: comune.nome,
        provincia: comune.provincia,
        tipologia,
        fascia_studenti: studenti,
        fascia_anno: anno,
        potenza_kwp: potenza,
      });
      setPhase({ kind: "result", data });
    } catch (e) {
      setPhase({ kind: "error", message: errorMessage(e) });
    }
    scrollToTop();
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      {phase.kind === "loading" && <LoadingCard />}

      {phase.kind === "error" && (
        <ErrorCard message={phase.message} onRetry={submit} />
      )}

      {phase.kind === "result" && (
        <ResultView
          result={phase.data}
          onBack={() => {
            setPhase({ kind: "form" });
            scrollToTop();
          }}
        />
      )}

      {phase.kind === "form" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <FieldCard
            label="Comune"
            hint="Scrivi e scegli dall'elenco: serve a usare i dati climatici giusti."
          >
            <ComuneAutocomplete
              comuni={comuni}
              loadError={comuniError}
              selection={comune}
              onSelect={setComune}
            />
          </FieldCard>

          <FieldCard label="Tipologia di scuola">
            <Pills
              name="Tipologia di scuola"
              options={TIPOLOGIE}
              value={tipologia}
              onChange={setTipologia}
            />
          </FieldCard>

          <FieldCard label="Numero di studenti">
            <Pills
              name="Numero di studenti"
              options={STUDENTI}
              value={studenti}
              onChange={setStudenti}
            />
          </FieldCard>

          <FieldCard label="Anno di costruzione dell'edificio">
            <Pills
              name="Anno di costruzione"
              options={ANNI}
              value={anno}
              onChange={setAnno}
            />
          </FieldCard>

          <FieldCard
            label="Potenza ipotizzata"
            hint="Facoltativo: se non lo sai, la calcoliamo noi sul fabbisogno stimato."
            secondary
          >
            <Pills
              name="Potenza ipotizzata"
              options={POTENZE}
              value={potenza}
              onChange={setPotenza}
            />
          </FieldCard>

          {/* CTA — sticky on mobile with safe-area padding; in-flow at the
              end of the column, so it never covers unscrollable content */}
          <div className="sticky bottom-0 z-20 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-meridiana-cream via-meridiana-cream/95 to-transparent md:static md:bg-none md:pb-0">
            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "w-full min-h-14 rounded-xl font-sans font-semibold text-base md:text-lg",
                "transition-all duration-200 ease-out",
                "motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridiana-yellow-hover",
                canSubmit
                  ? "bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black shadow-sm hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100 cursor-pointer"
                  : "bg-meridiana-yellow/40 text-meridiana-black/40 cursor-not-allowed",
              ].join(" ")}
            >
              Calcola la stima
            </button>
            {!canSubmit && (
              <p className="font-sans text-xs text-meridiana-text-tertiary text-center mt-2">
                Scegli comune, tipologia e numero di studenti per continuare.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
