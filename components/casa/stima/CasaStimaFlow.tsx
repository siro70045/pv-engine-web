"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, postCasaEstimate } from "@/lib/api";
import type {
  CasaEstimateRequest,
  CasaEstimateResponse,
  CasaOrientamento,
  CasaPresenzaDiurna,
  ComuneEntry,
} from "@/lib/types";
import ComuneAutocomplete, {
  type ComuneSelection,
} from "@/components/scuole/stima/ComuneAutocomplete";
import ErrorCard from "@/components/scuole/stima/ErrorCard";
import FieldCard from "@/components/scuole/stima/FieldCard";
import Pills from "@/components/scuole/stima/Pills";
import CasaLoadingCard from "./CasaLoadingCard";
import CasaResultView, { type CasaInputContext } from "./CasaResultView";

// Progressive-disclosure form for /casa/stima.
// n_occupants and floor_area_m2 are always required by the API (used for roof
// area estimation regardless of whether bolletta_kwh is provided).

type Phase =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "result"; data: CasaEstimateResponse }
  | { kind: "error"; message: string };

// ── option sets ────────────────────────────────────────────────────────────────

const CONSUMO_MODE = [
  { value: "bolletta" as const, label: "Sì, ce l'ho davanti" },
  { value: "proxy" as const, label: "No, stimatelo voi" },
];

const N_PERSONE = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5+", label: "5+" },
];

// Representative midpoints per fascia, sent as floor_area_m2
const SUPERFICIE = [
  { value: 50, label: "< 60 m²" },
  { value: 75, label: "60 – 90 m²" },
  { value: 110, label: "90 – 130 m²" },
  { value: 155, label: "130 – 180 m²" },
  { value: 220, label: "> 180 m²" },
];

const SI_NO = [
  { value: "si", label: "Sì" },
  { value: "no", label: "No" },
];

const PRESENZA: { value: CasaPresenzaDiurna; label: string }[] = [
  { value: "per_lo_piu_vuota", label: "Per lo più vuota" },
  { value: "spesso_occupata", label: "Spesso occupata" },
];

const ORIENTAMENTO: { value: CasaOrientamento; label: string }[] = [
  { value: "sud", label: "Sud" },
  { value: "sud_est_sud_ovest", label: "Sud-est o sud-ovest" },
  { value: "est_o_ovest", label: "Est o ovest" },
  { value: "nord", label: "Nord" },
  { value: "non_so", label: "Non lo so" },
];

const ABITAZIONE_PRINCIPALE = [
  { value: "si", label: "Sì" },
  { value: "no", label: "No" },
];

const TERMINALI: { value: string; label: string }[] = [
  { value: "termosifoni", label: "Termosifoni" },
  { value: "pavimento_radiante", label: "Pavimento radiante" },
  { value: "ventilconvettori", label: "Ventilconvettori" },
  { value: "non_so", label: "Non lo so" },
];

// ── animation wrapper ──────────────────────────────────────────────────────────

function RevealSection({
  children,
  sectionRef,
}: {
  children: React.ReactNode;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      ref={sectionRef}
      className={[
        "transition-all duration-300 ease-out scroll-mt-6",
        "motion-reduce:transition-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ── error message ──────────────────────────────────────────────────────────────

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 429)
      return "Troppe richieste ravvicinate. Riprova tra un minuto.";
    if (e.status === 503)
      return "Il servizio di calcolo è momentaneamente non disponibile. Riprova tra poco.";
    return "Non siamo riusciti a completare la stima. Riprova tra poco.";
  }
  return "Il servizio di calcolo è momentaneamente non disponibile. Riprova tra poco.";
}

// ── main component ─────────────────────────────────────────────────────────────

export default function CasaStimaFlow() {
  const [phase, setPhase] = useState<Phase>({ kind: "form" });

  // --- Form state ---
  const [comune, setComune] = useState<ComuneSelection | null>(null);
  const [consumoMode, setConsumoMode] = useState<"bolletta" | "proxy" | null>(null);
  const [bollettaKwhStr, setBollettaKwhStr] = useState("");
  // Proxy consumption factors (si/no strings, converted to boolean on submit)
  const [riscaldamento, setRiscaldamento] = useState<string | null>(null);
  const [acquaCalda, setAcquaCalda] = useState<string | null>(null);
  const [ev, setEv] = useState<string | null>(null);
  const [condizionatore, setCondizionatore] = useState<string | null>(null);
  // Always required by API
  const [nPersone, setNPersone] = useState<string | null>(null);
  const [superficieMq, setSuperficieMq] = useState<number | null>(null);
  // Main flow
  const [presenzaDiurna, setPresenzaDiurna] = useState<CasaPresenzaDiurna | null>(null);
  const [orientamento, setOrientamento] = useState<CasaOrientamento | null>(null);
  const [abitazionePrincipale, setAbitazionePrincipale] = useState<string | null>(null);
  // Optional advanced
  const [irpefStr, setIrpefStr] = useState("");
  const [potenzaStr, setPotenzaStr] = useState("");
  // Optional heat-pump electrification scenario inputs
  const [terminali, setTerminali] = useState<string | null>(null);
  const [gasSmc, setGasSmc] = useState("");
  const [gasSmcEstivo, setGasSmcEstivo] = useState("");

  // Step visibility: 0 = only comune; each value unlocks the next group
  const [revealed, setRevealed] = useState(0);

  // Comuni dataset — lazy loaded
  const [comuni, setComuni] = useState<ComuneEntry[] | null>(null);
  const [comuniError, setComuniError] = useState(false);
  useEffect(() => {
    fetch("/data/comuni.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setComuni)
      .catch(() => setComuniError(true));
  }, []);

  // Scroll refs, one per step
  const topRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);

  function advance(step: number, ref: React.RefObject<HTMLDivElement | null>) {
    if (step > revealed) {
      setRevealed(step);
      setTimeout(
        () => ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80,
      );
    }
  }

  // --- Derived: is consumo section complete? ---
  const bollettaKwh = parseFloat(bollettaKwhStr);
  const bollettaComplete =
    consumoMode === "bolletta" &&
    !isNaN(bollettaKwh) &&
    bollettaKwh > 0 &&
    nPersone !== null &&
    superficieMq !== null;
  const proxyComplete =
    consumoMode === "proxy" &&
    nPersone !== null &&
    superficieMq !== null &&
    riscaldamento !== null &&
    acquaCalda !== null &&
    ev !== null &&
    condizionatore !== null;
  const consumoComplete = bollettaComplete || proxyComplete;

  // --- Step advancement ---
  useEffect(() => {
    if (comune) advance(1, step1Ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comune]);

  useEffect(() => {
    if (consumoMode) advance(2, step2Ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumoMode]);

  useEffect(() => {
    if (consumoComplete) advance(3, step3Ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumoComplete]);

  useEffect(() => {
    if (presenzaDiurna) advance(4, step4Ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presenzaDiurna]);

  useEffect(() => {
    if (orientamento) advance(5, step5Ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientamento]);

  useEffect(() => {
    if (abitazionePrincipale) advance(6, step6Ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abitazionePrincipale]);

  const canSubmit =
    comune !== null &&
    consumoComplete &&
    presenzaDiurna !== null &&
    orientamento !== null &&
    abitazionePrincipale !== null;

  // "5+" -> 5 since the API expects an integer
  function parseNPersone(v: string): number {
    return v === "5+" ? 5 : parseInt(v, 10);
  }

  function buildRequest(): CasaEstimateRequest {
    const req: CasaEstimateRequest = {
      comune: comune!.nome,
      provincia: comune!.provincia,
      n_occupants: parseNPersone(nPersone!),
      floor_area_m2: superficieMq!,
      presenza_diurna: presenzaDiurna!,
      orientamento: orientamento!,
      abitazione_principale: abitazionePrincipale === "si",
    };

    if (consumoMode === "bolletta") {
      req.bolletta_kwh = bollettaKwh;
    } else {
      req.riscaldamento_elettrico = riscaldamento === "si";
      req.acqua_calda_elettrica = acquaCalda === "si";
      req.ev = ev === "si";
      req.condizionatore = condizionatore === "si";
    }

    const irpef = parseFloat(irpefStr);
    if (!isNaN(irpef) && irpef > 0) req.irpef_annua_stimata = irpef;

    const potenza = parseFloat(potenzaStr);
    if (!isNaN(potenza) && potenza > 0) req.potenza_kwp = potenza;

    if (terminali) req.terminali = terminali;
    const gas = parseFloat(gasSmc);
    if (!isNaN(gas) && gas > 0) req.gas_smc_annui = gas;
    const gasEst = parseFloat(gasSmcEstivo);
    if (!isNaN(gasEst) && gasEst > 0) req.gas_smc_estivi_mese = gasEst;

    return req;
  }

  function buildInputCtx(): CasaInputContext {
    return {
      consumoMode: consumoMode!,
      orientamento: orientamento!,
      abitazionePrincipale: abitazionePrincipale === "si",
      ev: ev === "si",
      riscaldamentoElettrico: riscaldamento === "si",
    };
  }

  async function submit() {
    if (!canSubmit) return;
    setPhase({ kind: "loading" });
    topRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    try {
      const data = await postCasaEstimate(buildRequest());
      setPhase({ kind: "result", data });
    } catch (e) {
      setPhase({ kind: "error", message: errorMessage(e) });
    }
    topRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function resetToForm() {
    setPhase({ kind: "form" });
    topRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      {phase.kind === "loading" && <CasaLoadingCard />}

      {phase.kind === "error" && (
        <ErrorCard message={phase.message} onRetry={submit} />
      )}

      {phase.kind === "result" && (
        <CasaResultView
          result={phase.data}
          inputCtx={buildInputCtx()}
          onBack={resetToForm}
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
          {/* Step 0: Comune */}
          <FieldCard
            label="Comune"
            hint="Serve a usare i dati di irraggiamento reali della tua zona."
          >
            <ComuneAutocomplete
              comuni={comuni}
              loadError={comuniError}
              selection={comune}
              onSelect={setComune}
            />
          </FieldCard>

          {/* Step 1: Conosci il consumo dalla bolletta? */}
          {revealed >= 1 && (
            <RevealSection sectionRef={step1Ref}>
              <FieldCard label="Conosci il consumo annuo dalla bolletta?">
                <Pills
                  name="Fonte consumo"
                  options={CONSUMO_MODE}
                  value={consumoMode}
                  onChange={setConsumoMode}
                />
              </FieldCard>
            </RevealSection>
          )}

          {/* Step 2a: bolletta path */}
          {revealed >= 2 && consumoMode === "bolletta" && (
            <RevealSection sectionRef={step2Ref}>
              <div className="space-y-4">
                <FieldCard
                  label="Consumo annuo (kWh)"
                  hint="Lo trovi in bolletta sotto 'energia attiva' o 'consumo annuo totale'."
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min={100}
                    max={20000}
                    placeholder="Es. 2400"
                    value={bollettaKwhStr}
                    onChange={(e) => setBollettaKwhStr(e.target.value)}
                    className="w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base bg-meridiana-cream-light border border-meridiana-border-light placeholder:text-meridiana-text-tertiary text-meridiana-black transition-colors duration-200 focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40 motion-reduce:transition-none"
                  />
                </FieldCard>
                <FieldCard
                  label="Quante persone in casa?"
                  hint="Serve a stimare la superficie del tetto disponibile per i pannelli."
                >
                  <Pills
                    name="Numero persone"
                    options={N_PERSONE}
                    value={nPersone}
                    onChange={setNPersone}
                  />
                </FieldCard>
                <FieldCard label="Superficie dell'abitazione">
                  <Pills
                    name="Superficie"
                    options={SUPERFICIE}
                    value={superficieMq}
                    onChange={setSuperficieMq}
                  />
                </FieldCard>
              </div>
            </RevealSection>
          )}

          {/* Step 2b: proxy path */}
          {revealed >= 2 && consumoMode === "proxy" && (
            <RevealSection sectionRef={step2Ref}>
              <div className="space-y-4">
                <FieldCard label="Quante persone vivono in casa?">
                  <Pills
                    name="Numero persone"
                    options={N_PERSONE}
                    value={nPersone}
                    onChange={setNPersone}
                  />
                </FieldCard>
                <FieldCard label="Superficie dell'abitazione">
                  <Pills
                    name="Superficie"
                    options={SUPERFICIE}
                    value={superficieMq}
                    onChange={setSuperficieMq}
                  />
                </FieldCard>
                <FieldCard
                  label="Riscaldamento elettrico?"
                  hint="Pompa di calore o stufe elettriche. Se usi il gas, rispondi no."
                >
                  <Pills
                    name="Riscaldamento elettrico"
                    options={SI_NO}
                    value={riscaldamento}
                    onChange={setRiscaldamento}
                  />
                </FieldCard>
                <FieldCard
                  label="Acqua calda elettrica?"
                  hint="Boiler elettrico. Se hai una caldaia a gas, rispondi no."
                >
                  <Pills
                    name="Acqua calda elettrica"
                    options={SI_NO}
                    value={acquaCalda}
                    onChange={setAcquaCalda}
                  />
                </FieldCard>
                <FieldCard label="Auto elettrica?">
                  <Pills
                    name="Auto elettrica"
                    options={SI_NO}
                    value={ev}
                    onChange={setEv}
                  />
                </FieldCard>
                <FieldCard label="Condizionatore?">
                  <Pills
                    name="Condizionatore"
                    options={SI_NO}
                    value={condizionatore}
                    onChange={setCondizionatore}
                  />
                </FieldCard>
              </div>
            </RevealSection>
          )}

          {/* Step 3: Presenza diurna */}
          {revealed >= 3 && (
            <RevealSection sectionRef={step3Ref}>
              <FieldCard
                label="Durante il giorno la casa è…"
                hint="Influisce su quanta energia riesci a usare mentre il sole produce."
              >
                <Pills
                  name="Presenza diurna"
                  options={PRESENZA}
                  value={presenzaDiurna}
                  onChange={setPresenzaDiurna}
                />
              </FieldCard>
            </RevealSection>
          )}

          {/* Step 4: Orientamento tetto */}
          {revealed >= 4 && (
            <RevealSection sectionRef={step4Ref}>
              <FieldCard label="Dove guarda il tetto?">
                <Pills
                  name="Orientamento tetto"
                  options={ORIENTAMENTO}
                  value={orientamento}
                  onChange={setOrientamento}
                />
              </FieldCard>
            </RevealSection>
          )}

          {/* Step 5: Abitazione principale */}
          {revealed >= 5 && (
            <RevealSection sectionRef={step5Ref}>
              <FieldCard
                label="È la tua abitazione principale?"
                hint="Cambia l'aliquota della detrazione fiscale: 50% per la principale, 36% per le altre."
              >
                <Pills
                  name="Abitazione principale"
                  options={ABITAZIONE_PRINCIPALE}
                  value={abitazionePrincipale}
                  onChange={setAbitazionePrincipale}
                />
              </FieldCard>
            </RevealSection>
          )}

          {/* Step 6: Optional advanced */}
          {revealed >= 6 && (
            <RevealSection sectionRef={step6Ref}>
              <details className="group bg-white rounded-2xl shadow-[0_8px_30px_rgba(26,22,18,0.06)] overflow-hidden">
                <summary className="list-none cursor-pointer min-h-11 px-5 py-4 flex items-center justify-between font-sans text-sm font-semibold text-meridiana-text-secondary select-none">
                  Affina la stima (facoltativo)
                  <span
                    aria-hidden
                    className="text-meridiana-text-tertiary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    ▾
                  </span>
                </summary>
                <div className="border-t border-meridiana-border-light px-5 pb-5 pt-4 space-y-5">
                  {/* Heat-pump electrification inputs */}
                  <div className="space-y-4">
                    <div>
                      <p className="font-sans text-sm font-semibold text-meridiana-text-secondary mb-0.5">
                        Per stimare lo scenario con pompa di calore
                      </p>
                      <p className="font-sans text-xs text-meridiana-text-tertiary leading-relaxed mb-3">
                        Questi dati permettono di stimare quanto cambierebbe la
                        convenienza del fotovoltaico sostituendo il riscaldamento
                        a gas. Inserire il consumo gas migliora molto
                        l&apos;accuratezza: senza, si parte da una media di
                        33 kWh/m².
                      </p>
                      <label className="font-sans text-xs font-semibold text-meridiana-text-tertiary uppercase tracking-wider block mb-2">
                        Terminali di riscaldamento
                      </label>
                      <Pills
                        name="Terminali riscaldamento"
                        options={TERMINALI}
                        value={terminali}
                        onChange={setTerminali}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-sans text-xs font-semibold text-meridiana-text-tertiary uppercase tracking-wider block mb-1">
                          Consumo annuo di gas (Smc)
                        </label>
                        <p className="font-sans text-xs text-meridiana-text-tertiary mb-2 leading-relaxed">
                          Dal totale annuale in bolletta. Include riscaldamento,
                          acqua calda e cucina.
                        </p>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={10000}
                          placeholder="Es. 1200"
                          value={gasSmc}
                          onChange={(e) => setGasSmc(e.target.value)}
                          className="w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base bg-meridiana-cream-light border border-meridiana-border-light placeholder:text-meridiana-text-tertiary text-meridiana-black transition-colors duration-200 focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40 motion-reduce:transition-none"
                        />
                      </div>
                      <div>
                        <label className="font-sans text-xs font-semibold text-meridiana-text-tertiary uppercase tracking-wider block mb-1">
                          Gas in un mese estivo (Smc)
                        </label>
                        <p className="font-sans text-xs text-meridiana-text-tertiary mb-2 leading-relaxed">
                          Luglio o agosto, riscaldamento spento. Serve a
                          separare cucina e acqua calda dal riscaldamento.
                        </p>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={500}
                          placeholder="Es. 20"
                          value={gasSmcEstivo}
                          onChange={(e) => setGasSmcEstivo(e.target.value)}
                          className="w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base bg-meridiana-cream-light border border-meridiana-border-light placeholder:text-meridiana-text-tertiary text-meridiana-black transition-colors duration-200 focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40 motion-reduce:transition-none"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-meridiana-border-light" />

                  <div>
                    <label className="font-sans text-sm font-semibold text-meridiana-text-secondary block mb-1">
                      IRPEF annua lorda (€)
                    </label>
                    <p className="font-sans text-xs text-meridiana-text-tertiary mb-2">
                      Serve a verificare se recuperi tutta la detrazione nei
                      dieci anni previsti.
                    </p>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Es. 28000"
                      value={irpefStr}
                      onChange={(e) => setIrpefStr(e.target.value)}
                      className="w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base bg-meridiana-cream-light border border-meridiana-border-light placeholder:text-meridiana-text-tertiary text-meridiana-black transition-colors duration-200 focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40 motion-reduce:transition-none"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-sm font-semibold text-meridiana-text-secondary block mb-1">
                      Potenza già preventivata (kWp)
                    </label>
                    <p className="font-sans text-xs text-meridiana-text-tertiary mb-2">
                      Se hai già un preventivo, inserisci la taglia proposta.
                    </p>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={100}
                      step={0.5}
                      placeholder="Es. 4.5"
                      value={potenzaStr}
                      onChange={(e) => setPotenzaStr(e.target.value)}
                      className="w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base bg-meridiana-cream-light border border-meridiana-border-light placeholder:text-meridiana-text-tertiary text-meridiana-black transition-colors duration-200 focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40 motion-reduce:transition-none"
                    />
                  </div>
                </div>
              </details>
            </RevealSection>
          )}

          {/* CTA — sticky on mobile */}
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
            {!canSubmit && revealed >= 5 && (
              <p className="font-sans text-xs text-meridiana-text-tertiary text-center mt-2">
                Rispondi a tutte le domande per continuare.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
