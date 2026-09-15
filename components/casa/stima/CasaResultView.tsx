"use client";

import type {
  CasaEstimateResponse,
  CasaOrientamento,
  CasaScenarioAlternativo,
  CasaVerdetto,
} from "@/lib/types";

// ── helpers ────────────────────────────────────────────────────────────────────

const nf0 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function eur(v: number) {
  return `€ ${nf0.format(v)}`;
}

function ceilToThousands(v: number) {
  return Math.ceil(v / 1000) * 1000;
}

function ceilToHalfYear(v: number) {
  return Math.ceil(v * 2) / 2;
}

function formatYears(v: number) {
  return Number.isInteger(v) ? nf0.format(v) : nf1.format(v);
}

function paybackRange(low: number, high: number) {
  const l = ceilToHalfYear(low);
  const h = ceilToHalfYear(high);
  return l === h
    ? `circa ${formatYears(l)} anni`
    : `tra ${formatYears(l)} e ${formatYears(h)} anni`;
}

function roundPct(v: number) {
  return Math.round(v / 5) * 5;
}

// ── verdetto ───────────────────────────────────────────────────────────────────

const VERDETTO_LABEL: Record<CasaVerdetto, string> = {
  ottimo: "Un ottimo investimento",
  buono: "Un buon investimento",
  accettabile: "Un investimento ragionevole",
  marginale: "Un investimento al limite",
  negativo: "Su questa casa, il fotovoltaico conviene poco",
};

const VERDETTO_BORDER: Record<CasaVerdetto, string> = {
  ottimo: "border-l-4 border-meridiana-green",
  buono: "border-l-4 border-meridiana-green",
  accettabile: "border-l-4 border-meridiana-border-medium",
  marginale: "border-l-4 border-meridiana-text-tertiary",
  negativo: "border-l-4 border-meridiana-text-tertiary",
};

// ── stat card ──────────────────────────────────────────────────────────────────

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

// ── input context passed from the form ────────────────────────────────────────

export interface CasaInputContext {
  consumoMode: "bolletta" | "proxy";
  orientamento: CasaOrientamento;
  abitazionePrincipale: boolean;
  ev: boolean;
  riscaldamentoElettrico: boolean;
}

// ── leve ───────────────────────────────────────────────────────────────────────

function computeLeve(
  result: CasaEstimateResponse,
  ctx: CasaInputContext,
): string[] {
  const leve: string[] = [];
  const autoSuff = result.verdetto_pv.autosufficienza_pct;

  if (!result.consumo_da_bolletta) {
    leve.push(
      "Con il consumo reale della bolletta la stima si restringe molto: il dato proxy introduce un'incertezza del ±30%.",
    );
  }

  if (ctx.orientamento === "non_so") {
    leve.push(
      "Sapere dove guarda il tetto cambia parecchio: da sud a nord la produzione cala di oltre il 40%.",
    );
  }

  if (autoSuff < 40) {
    leve.push(
      "Consumare di più nelle ore di sole — elettrodomestici di giorno, lavastoviglie e lavatrice in fascia centrale — migliora il risultato.",
    );
  }

  if (!result.consumo_da_bolletta && !ctx.ev && !ctx.riscaldamentoElettrico) {
    leve.push(
      "Con una pompa di calore o un'auto elettrica il quadro cambia: più consumi nelle ore di sole, più il fotovoltaico rende.",
    );
  }

  if (!ctx.abitazionePrincipale) {
    leve.push(
      "Sull'abitazione principale la detrazione è 50% invece di 36%: il rientro si accorcia in modo sensibile.",
    );
  }

  const isPositive = ["accettabile", "buono", "ottimo"].includes(
    result.verdetto_pv.etichetta,
  );
  if (isPositive) {
    leve.push(
      "La detrazione al 50% vale per le spese sostenute nel 2026; dal 2027 è prevista al 36%.",
    );
  }

  return leve.slice(0, 3);
}

// ── scenario elettrificazione ──────────────────────────────────────────────────

function ScenarioElettricCard({
  s,
  baseCons,
}: {
  s: CasaScenarioAlternativo;
  baseCons: number;
}) {
  const isIndicative = s.descrizione.toLowerCase().includes("stima indicativa");
  const dv = s.delta_vs_base;

  function DeltaCell({
    label,
    value,
    colorClass,
    sub,
  }: {
    label: string;
    value: string;
    colorClass: string;
    sub: string;
  }) {
    return (
      <div className="rounded-xl p-3 bg-meridiana-cream-light border border-meridiana-border-light">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-meridiana-text-tertiary">
          {label}
        </p>
        <p className={`font-sans text-base font-semibold mt-1 tabular-nums ${colorClass}`}>
          {value}
        </p>
        <p className="font-sans text-[10px] text-meridiana-text-tertiary mt-0.5">
          {sub}
        </p>
      </div>
    );
  }

  const sign = (v: number) => (v >= 0 ? "+" : "");

  return (
    <div
      className={[
        "rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]",
        isIndicative
          ? "bg-white border-2 border-dashed border-meridiana-border-medium"
          : "bg-white",
      ].join(" ")}
    >
      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-meridiana-text-tertiary">
        Cosa cambierebbe con una pompa di calore
      </p>
      <h3 className="font-sans text-base font-semibold text-meridiana-black mt-1 mb-1">
        {s.titolo}
      </h3>
      <p className="font-sans text-xs text-meridiana-text-secondary mb-4 leading-relaxed">
        Con pompa di calore il consumo elettrico diventerebbe{" "}
        <strong>
          {nf0.format(Math.round(s.metriche.consumo_elettrico_stimato_kwh))} kWh/anno
        </strong>{" "}
        (ora {nf0.format(Math.round(baseCons))} kWh), con un impianto da{" "}
        <strong>{nf1.format(s.metriche.kwp_consigliato)} kWp</strong>.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <DeltaCell
          label="Δ NPV"
          value={`${sign(dv.npv_eur)}${eur(Math.round(dv.npv_eur))}`}
          colorClass={
            dv.npv_eur >= 0
              ? "text-meridiana-green"
              : "text-meridiana-red"
          }
          sub="valore a 25 anni"
        />
        <DeltaCell
          label="Δ Payback"
          value={`${sign(dv.payback_anni)}${nf1.format(dv.payback_anni)} anni`}
          colorClass={
            dv.payback_anni <= 0
              ? "text-meridiana-green"
              : "text-meridiana-red"
          }
          sub="tempo di rientro"
        />
        <DeltaCell
          label="Δ Autosufficienza"
          value={`${sign(dv.autosufficienza_pp)}${nf1.format(dv.autosufficienza_pp)} pp`}
          colorClass="text-meridiana-text-secondary"
          sub="punti percentuali"
        />
      </div>
      <div className="mt-4 bg-meridiana-cream-light rounded-xl p-4 border-l-2 border-meridiana-border-medium">
        <p className="font-sans text-xs text-meridiana-text-secondary leading-relaxed whitespace-pre-wrap">
          {s.descrizione}
        </p>
      </div>
      {isIndicative && (
        <p className="font-sans text-xs text-meridiana-text-tertiary mt-3 leading-relaxed pl-4 relative before:content-['→'] before:absolute before:left-0">
          Inserisci il consumo annuo di gas nella sezione &ldquo;Affina la
          stima&rdquo; per una stima più precisa.
        </p>
      )}
    </div>
  );
}

// ── livello di difesa ──────────────────────────────────────────────────────────

function DifesaSection({
  result,
  inputCtx,
}: {
  result: CasaEstimateResponse;
  inputCtx: CasaInputContext;
}) {
  const sb = result.senza_batteria;
  const kwp = result.kwp_ipotizzato;
  const prod = result.produzione_annua_kwh;
  const capex = sb.capex_eur;
  const aliquota = inputCtx.abitazionePrincipale ? 50 : 36;

  const totLordo = sb.detrazione_totale_eur ?? capex * (aliquota / 100);
  const totEffettivo = sb.detrazione_effettiva_eur ?? totLordo;
  const quotaAnn = totEffettivo / 10;
  const isCapFull =
    sb.detrazione_effettiva_eur !== undefined
      ? Math.abs(totLordo - totEffettivo) < 1
      : true;

  const lo = Math.round(capex * 0.83);
  const hi = Math.round(capex * 1.2);

  function Card({
    num,
    title,
    children,
  }: {
    num: string;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-meridiana-yellow">
          {num}
        </p>
        <h3 className="font-sans text-sm font-semibold text-meridiana-black mt-1 mb-3">
          {title}
        </h3>
        {children}
      </div>
    );
  }

  return (
    <div>
      <p className="font-sans text-base font-semibold text-meridiana-black mb-1">
        Se parli con un installatore
      </p>
      <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed mb-4">
        Tre elementi concreti ricavati dalla stima appena calcolata. Non per
        diffidare, ma per farti un&apos;idea tua.
      </p>
      <div className="space-y-3">
        <Card num="01" title="Quanto dovrebbe costare">
          <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed">
            Un impianto da{" "}
            <strong>{nf1.format(kwp)} kWp</strong> su una casa come la tua
            dovrebbe costare indicativamente:
          </p>
          <p className="font-sans text-2xl font-semibold text-meridiana-black my-2">
            {eur(ceilToThousands(capex))}
          </p>
          <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed">
            Fascia ragionevole:{" "}
            <strong>
              {eur(lo)} – {eur(hi)}
            </strong>{" "}
            (±15–20%, chiavi in mano IVA inclusa).
          </p>
          <p className="font-sans text-xs text-meridiana-text-tertiary mt-3 leading-relaxed italic">
            Se un preventivo si discosta molto, chiedi cosa include. Molto
            sotto: materiali di qualità inferiore o costi nascosti. Molto
            sopra: verifica se include accumulo o pratiche non richieste.
          </p>
        </Card>

        <Card num="02" title="Quanto dovrebbe produrre">
          <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed">
            Un impianto da{" "}
            <strong>{nf1.format(kwp)} kWp</strong> nella tua zona dovrebbe
            produrre circa:
          </p>
          <p className="font-sans text-2xl font-semibold text-meridiana-black my-2">
            {nf0.format(prod)} kWh/anno
          </p>
          <p className="font-sans text-xs text-meridiana-text-tertiary leading-relaxed">
            Stima basata su dati meteo tipici (TMY – PVGIS), inclinazione 30°,
            orientamento dichiarato.
          </p>
          <p className="font-sans text-xs text-meridiana-text-tertiary mt-3 leading-relaxed italic">
            Se l&apos;installatore promette oltre il 15% in più, chiedi su
            quali dati si basa. Strumento pubblico di riferimento: PVGIS
            (European Commission, re.jrc.ec.europa.eu).
          </p>
        </Card>

        <Card num="03" title="Come funziona la detrazione">
          <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed">
            La detrazione{" "}
            <strong>{aliquota}%</strong> non è uno sconto in fattura: paghi
            l&apos;intero importo e recuperi la quota in dieci dichiarazioni dei
            redditi consecutive.
          </p>
          <p className="font-sans text-2xl font-semibold text-meridiana-black my-2">
            {eur(Math.round(quotaAnn))}/anno
          </p>
          <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed">
            Per 10 anni, per un totale di{" "}
            <strong>{eur(Math.round(totEffettivo))}</strong>
            {!isCapFull && " — limitato dall'IRPEF dichiarata"}.
          </p>
          <p className="font-sans text-sm text-meridiana-text-secondary mt-2 leading-relaxed">
            Il 50% è valido per le spese sostenute nel 2026 (L. 207/2024). Dal
            2027 l&apos;aliquota scende al 36%, salvo proroga parlamentare.
          </p>
          <p className="font-sans text-xs text-meridiana-text-tertiary mt-3 leading-relaxed italic">
            Se l&apos;installatore propone cessione del credito o sconto in
            fattura, verifica chi garantisce il trasferimento: questi meccanismi
            non sono più automatici per il residenziale.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function CasaResultView({
  result,
  inputCtx,
  onBack,
}: {
  result: CasaEstimateResponse;
  inputCtx: CasaInputContext;
  onBack: () => void;
}) {
  const r = result;
  const { nome, provincia } = r.comune_risolto;
  const verdetto = r.verdetto_pv.etichetta;
  const verdLabel = VERDETTO_LABEL[verdetto];
  const verdBorder = VERDETTO_BORDER[verdetto];

  const investimentoValue = `circa ${eur(ceilToThousands(r.capex_indicativo_eur))}`;
  const paybackValue = paybackRange(r.payback_anni.low, r.payback_anni.high);
  const autosuffValue = `circa ${roundPct(r.verdetto_pv.autosufficienza_pct)}%`;

  const leve = computeLeve(r, inputCtx);

  const senzaPb = ceilToHalfYear(r.senza_batteria.payback_anni);
  const conPb = ceilToHalfYear(r.con_batteria.payback_anni);

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
              Impianto ipotizzato:{" "}
              <strong>{nf1.format(r.kwp_ipotizzato)} kWp</strong>
              {r.auto_dimensionato && (
                <span className="text-meridiana-text-tertiary">
                  {" "}— taglia calcolata sul fabbisogno stimato
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

      {/* A: Verdetto */}
      <div
        className={[
          "bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]",
          verdBorder,
        ].join(" ")}
      >
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-meridiana-text-tertiary">
          Il verdetto
        </p>
        <h2 className="font-sans text-xl md:text-2xl font-semibold text-meridiana-black mt-2">
          {verdLabel}
        </h2>
        <p className="font-sans text-sm text-meridiana-text-secondary mt-2 leading-relaxed">
          {r.verdetto_pv.testo}
        </p>
      </div>

      {/* B: 3 numeri chiave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          hero
          label="Quanto copre della bolletta"
          value={autosuffValue}
          detail="Quota del tuo consumo annuo coperta direttamente dall'impianto, senza batteria."
        />
        <StatCard
          label="Investimento indicativo"
          value={investimentoValue}
          detail="Costo chiavi in mano IVA inclusa; incentivo non ancora dedotto."
        />
        <StatCard label="Tempo di rientro" value={paybackValue} />
      </div>

      {/* C: Cosa cambierebbe le cose */}
      {leve.length > 0 && (
        <div className="bg-meridiana-cream-light rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]">
          <p className="font-sans text-sm font-semibold text-meridiana-black">
            Cosa cambierebbe le cose
          </p>
          <ul className="mt-3 space-y-2.5">
            {leve.map((l, i) => (
              <li
                key={i}
                className="font-sans text-sm text-meridiana-text-secondary leading-relaxed pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-meridiana-text-tertiary"
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* D: Scenario elettrificazione */}
      {(() => {
        const s = r.scenari_alternativi?.find(
          (x) => x.tipo === "elettrificazione",
        );
        return s ? (
          <ScenarioElettricCard s={s} baseCons={r.consumo_kwh_annuo} />
        ) : null;
      })()}

      {/* E: Batteria — due scenari affiancati */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]">
        <p className="font-sans text-sm font-semibold text-meridiana-black">
          Con o senza batteria?
        </p>
        <p className="font-sans text-xs text-meridiana-text-tertiary mt-1">
          La batteria accumula energia per la sera; cambia autosufficienza e
          costo, non la produzione.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(
            [
              {
                key: "senza",
                label: "Senza batteria",
                s: r.senza_batteria,
                pb: senzaPb,
              },
              {
                key: "con",
                label: "Con batteria",
                s: r.con_batteria,
                pb: conPb,
              },
            ] as const
          ).map(({ key, label, s, pb }) => (
            <div
              key={key}
              className="rounded-xl p-4 bg-meridiana-cream-light border border-meridiana-border-light"
            >
              <p className="font-sans text-xs font-semibold text-meridiana-text-secondary uppercase tracking-wide">
                {label}
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="font-sans text-[11px] text-meridiana-text-tertiary uppercase tracking-wide">
                    Autosufficienza
                  </p>
                  <p className="font-sans text-base font-semibold text-meridiana-black">
                    {roundPct(s.autosufficienza_pct)}%
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[11px] text-meridiana-text-tertiary uppercase tracking-wide">
                    Investimento
                  </p>
                  <p className="font-sans text-base font-semibold text-meridiana-black">
                    {eur(ceilToThousands(s.capex_eur))}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[11px] text-meridiana-text-tertiary uppercase tracking-wide">
                    Rientro
                  </p>
                  <p className="font-sans text-sm font-semibold text-meridiana-black">
                    circa {formatYears(pb)} anni
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Delta note */}
        {(() => {
          const delta = r.con_batteria.payback_anni - r.senza_batteria.payback_anni;
          if (delta > 0.5) {
            return (
              <p className="font-sans text-xs text-meridiana-text-tertiary mt-3 leading-relaxed">
                La batteria aumenta l&apos;autosufficienza ma allunga il rientro
                di circa {formatYears(ceilToHalfYear(delta))} anni.
              </p>
            );
          }
          if (delta < -0.5) {
            return (
              <p className="font-sans text-xs text-meridiana-text-tertiary mt-3 leading-relaxed">
                In questo profilo la batteria accorcia il rientro di circa{" "}
                {formatYears(ceilToHalfYear(Math.abs(delta)))} anni.
              </p>
            );
          }
          return (
            <p className="font-sans text-xs text-meridiana-text-tertiary mt-3">
              La batteria non cambia sensibilmente il tempo di rientro in questo
              profilo.
            </p>
          );
        })()}
      </div>

      {/* F: Livello di difesa */}
      <DifesaSection result={r} inputCtx={inputCtx} />

      {/* G: Ventaglio taglie */}
      <details className="group bg-white rounded-2xl shadow-[0_8px_30px_rgba(26,22,18,0.06)] overflow-hidden">
        <summary className="list-none cursor-pointer min-h-11 px-5 md:px-6 py-4 flex items-center justify-between font-sans text-sm font-semibold text-meridiana-black select-none">
          Le taglie disponibili
          <span
            aria-hidden
            className="text-meridiana-text-tertiary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          >
            ▾
          </span>
        </summary>
        <div className="border-t border-meridiana-border-light">
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="bg-meridiana-cream-light text-meridiana-text-tertiary text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left font-semibold">kWp</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Investimento
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Autosufficienza
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Rientro</th>
                  <th className="px-4 py-2 text-left font-semibold">Taglia</th>
                </tr>
              </thead>
              <tbody>
                {r.taglie_confronto.map((t, i) => (
                  <tr key={i} className="border-t border-meridiana-border-light">
                    <td className="px-4 py-3 text-meridiana-black font-medium">
                      {nf1.format(t.kwp)}
                    </td>
                    <td className="px-4 py-3 text-meridiana-text-secondary">
                      {eur(ceilToThousands(t.capex_eur))}
                    </td>
                    <td className="px-4 py-3 text-meridiana-text-secondary">
                      {roundPct(t.autosufficienza_pct)}%
                    </td>
                    <td className="px-4 py-3 text-meridiana-text-secondary">
                      {formatYears(ceilToHalfYear(t.payback_anni))} anni
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-meridiana-cream-light border border-meridiana-border-light text-meridiana-text-secondary text-xs">
                        {t.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* H: Assunzioni */}
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

      {/* I: Nota Livello 2 */}
      <p className="font-sans text-sm text-meridiana-text-tertiary leading-relaxed px-1">
        Per un&apos;analisi completa con i dati reali della tua abitazione —
        consumi orari, dimensionamento preciso, confronto tariffario e
        simulazione finanziaria — è disponibile la stima di Livello 2.
      </p>
    </div>
  );
}
