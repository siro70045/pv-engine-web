"use client";

import type { EstimateResponse } from "@/lib/types";

// Result view — replaces the form on the same route. Ephemeral by design:
// "Modifica i dati" returns to the form with selections preserved.
// Shows ONLY 3 metrics (produzione, investimento, payback) — the other
// metrics (risparmio, cessione, beneficio, CO₂, taglie) are deliberately
// reserved for the full report. Rounding is presentation-only: the API
// stays precise.

const LEAD_EMAIL = "nicola.sirotti.07@gmail.com"; // provisional mailto target

const nf0 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function eur(v: number): string {
  return `€ ${nf0.format(v)}`;
}

function roundToThousands(v: number): number {
  return Math.round(v / 1000) * 1000;
}

function roundToHalfYear(v: number): number {
  return Math.round(v * 2) / 2;
}

function formatYears(v: number): string {
  return Number.isInteger(v) ? nf0.format(v) : nf1.format(v);
}

function StatCard({
  label,
  value,
  detail,
  hero = false,
}: {
  label: string;
  value: string;
  detail?: string;
  hero?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]",
        "transition-[scale,box-shadow] duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(26,22,18,0.12)] motion-reduce:transition-none motion-reduce:hover:scale-100",
        hero ? "bg-meridiana-yellow sm:col-span-2" : "bg-white",
      ].join(" ")}
    >
      <p
        className={[
          "font-sans text-xs font-semibold uppercase tracking-wider",
          hero ? "text-meridiana-black/70" : "text-meridiana-text-tertiary",
        ].join(" ")}
      >
        {label}
      </p>
      <p
        className={[
          "font-sans font-semibold text-meridiana-black mt-2 leading-tight",
          hero ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
        ].join(" ")}
      >
        {value}
      </p>
      {detail && (
        <p
          className={[
            "font-sans text-xs mt-2 leading-relaxed",
            hero ? "text-meridiana-black/70" : "text-meridiana-text-tertiary",
          ].join(" ")}
        >
          {detail}
        </p>
      )}
    </div>
  );
}

export default function ResultView({
  result,
  onBack,
}: {
  result: EstimateResponse;
  onBack: () => void;
}) {
  const r = result;
  const { nome, provincia } = r.comune_risolto;

  // Payback rounded to the half year: when low and high collapse to the
  // same value the range is noise, so show a single "circa" figure.
  const paybackLow = roundToHalfYear(r.payback_anni.low);
  const paybackHigh = roundToHalfYear(r.payback_anni.high);
  const paybackValue =
    paybackLow === paybackHigh
      ? `circa ${formatYears(paybackLow)} anni`
      : `tra ${formatYears(paybackLow)} e ${formatYears(paybackHigh)} anni`;

  const mailto = `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent(
    `Richiesta report completo — ${nome} (${provincia})`,
  )}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-sans text-lg md:text-xl font-semibold text-meridiana-black">
              Stima preliminare — {nome} ({provincia})
            </h2>
            <p className="font-sans text-sm text-meridiana-text-secondary mt-1">
              Impianto ipotizzato: <strong>{nf1.format(r.kwp_ipotizzato)} kWp</strong>
              {r.auto_dimensionato && (
                <span className="text-meridiana-text-tertiary">
                  {" "}
                  — taglia calcolata sul fabbisogno stimato
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 px-5 rounded-full font-sans text-sm font-semibold bg-meridiana-cream-light border border-meridiana-border-medium text-meridiana-black transition-all duration-200 ease-out active:scale-[0.98] hover:border-meridiana-black motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer"
          >
            ← Modifica i dati
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          hero
          label="Produzione annua"
          value={`circa ${nf0.format(roundToThousands(r.produzione_annua_kwh.low))} kWh all'anno`}
          detail="Energia prodotta dall'impianto nel primo anno, calcolata sull'irraggiamento storico della tua zona."
        />
        <StatCard
          label="Investimento indicativo"
          value={`circa ${eur(roundToThousands(r.capex_indicativo_eur))}`}
          detail="Listino per edifici pubblici, inclusa verifica strutturale, IVA inclusa."
        />
        <StatCard label="Tempo di rientro" value={paybackValue} />
      </div>

      {/* Full-report tease + CTA */}
      <div className="bg-meridiana-cream-light rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(26,22,18,0.06)] text-center">
        <p className="font-sans text-sm md:text-base text-meridiana-text-secondary leading-relaxed max-w-lg mx-auto">
          Nel report completo: il beneficio economico anno per anno, la
          CO&#8322; evitata, il confronto tra tre taglie d&apos;impianto, la
          verifica della copertura, gli incentivi applicabili — in un
          documento da allegare in delibera.
        </p>
        <a
          href={mailto}
          className="inline-block mt-6 w-full sm:w-auto sm:px-10 bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black font-sans font-semibold text-base px-6 py-4 rounded-xl shadow-sm transition-all duration-200 ease-out active:scale-[0.98] hover:shadow-md motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          Richiedi il report completo
        </a>
      </div>

      {/* Honesty block */}
      <details className="group bg-white rounded-2xl shadow-[0_8px_30px_rgba(26,22,18,0.06)] overflow-hidden">
        <summary className="list-none cursor-pointer min-h-11 px-5 md:px-6 py-4 flex items-center justify-between font-sans text-sm font-semibold text-meridiana-black select-none">
          Le ipotesi di questa stima
          <span
            aria-hidden
            className="text-meridiana-text-tertiary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          >
            ▾
          </span>
        </summary>
        <ul className="px-5 md:px-6 pb-5 space-y-2 border-t border-meridiana-border-light pt-4">
          {r.assunzioni.map((a, i) => (
            <li
              key={i}
              className="font-sans text-sm text-meridiana-text-secondary leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-meridiana-text-tertiary"
            >
              {a}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
