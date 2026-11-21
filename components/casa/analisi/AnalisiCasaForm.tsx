"use client";

import { useEffect, useId, useRef, useState } from "react";
import { postAnalisiCasa } from "@/lib/api";
import { parsePrefill, usePrefillRaw, type CasaPrefill } from "@/lib/casaPrefill";
import type {
  CasaEstimateRequest,
  CasaOmbraDurata,
  CasaOmbraLato,
  CasaOmbraOstacoli,
  CasaOrientamento,
  CasaPresenzaDiurna,
  CasaTipoAbitazione,
  ComuneEntry,
  PreventivoInput,
} from "@/lib/types";
import ComuneAutocomplete, {
  type ComuneSelection,
} from "@/components/scuole/stima/ComuneAutocomplete";
import FieldCard from "@/components/scuole/stima/FieldCard";
import Pills from "@/components/scuole/stima/Pills";

// /casa/analisi — Livello 2 request form (skeleton, 22 nov 2026).
// Answers given in /casa/stima arrive pre-filled (sessionStorage, same tab).
// On submit the Next.js route mails the request to Sirot, then runs the engine
// with report=true and mails the numbers: Sirot reviews before replying.
// The map slot is a placeholder until the aerial-photo map is built.

// ── option sets ────────────────────────────────────────────────────────────────

const SI_NO = [
  { value: "si", label: "Sì" },
  { value: "no", label: "No" },
];

const TIPO: { value: CasaTipoAbitazione; label: string }[] = [
  { value: "casa", label: "Casa indipendente o a schiera" },
  { value: "appartamento", label: "Appartamento in condominio" },
];

const N_PERSONE = ["1", "2", "3", "4", "5", "6+"].map((v) => ({ value: v, label: v }));

const PRESENZA: { value: CasaPresenzaDiurna; label: string }[] = [
  { value: "per_lo_piu_vuota", label: "Per lo più vuota" },
  { value: "spesso_occupata", label: "Spesso occupata" },
];

const ORIENTAMENTO: { value: CasaOrientamento; label: string }[] = [
  { value: "sud", label: "Sud" },
  { value: "sud_est_sud_ovest", label: "Sud-est o sud-ovest" },
  { value: "est", label: "Est" },
  { value: "ovest", label: "Ovest" },
  { value: "nord", label: "Nord" },
  { value: "non_so", label: "Non lo so" },
];

const OSTACOLI: { value: CasaOmbraOstacoli; label: string }[] = [
  { value: "no", label: "No" },
  { value: "si", label: "Sì" },
  { value: "non_so", label: "Non lo so" },
];

const LATI: { value: CasaOmbraLato; label: string }[] = [
  { value: "sud", label: "Sud" },
  { value: "est", label: "Est" },
  { value: "ovest", label: "Ovest" },
];

const DURATA: { value: CasaOmbraDurata; label: string }[] = [
  { value: "qualche_ora", label: "Qualche ora" },
  { value: "buona_parte", label: "Buona parte del giorno" },
];

const TERMINALI = [
  { value: "termosifoni", label: "Termosifoni" },
  { value: "pavimento_radiante", label: "Pavimento radiante" },
  { value: "ventilconvettori", label: "Ventilconvettori" },
  { value: "non_so", label: "Non lo so" },
];

const MAX_PREVENTIVI = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base bg-meridiana-cream-light border border-meridiana-border-light placeholder:text-meridiana-text-tertiary text-meridiana-black transition-colors duration-200 focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40 motion-reduce:transition-none";

const labelClass =
  "font-sans text-xs font-semibold text-meridiana-text-tertiary uppercase tracking-wider block mb-1";

// ── small pieces ───────────────────────────────────────────────────────────────

function SectionTitle({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="pt-6 first:pt-0 px-1">
      <p className="font-sans text-xs font-semibold text-meridiana-text-tertiary uppercase tracking-wider">
        {String(n).padStart(2, "0")}
      </p>
      <h2 className="font-serif text-2xl text-meridiana-black font-semibold mt-1">{title}</h2>
      {hint && (
        <p className="font-sans text-sm text-meridiana-text-secondary leading-relaxed mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {hint && (
        <p className="font-sans text-xs text-meridiana-text-tertiary mb-2 leading-relaxed">{hint}</p>
      )}
      {/* text + inputMode: number inputs reject the Italian decimal comma in
          some browsers ("4,5"); num() accepts both comma and dot */}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

// Multi-select variant of Pills (shading sides can be more than one).
function MultiPills<T extends string>({
  options,
  values,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  values: T[];
  onChange: (v: T[]) => void;
  name: string;
}) {
  return (
    <div role="group" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onChange(selected ? values.filter((v) => v !== opt.value) : [...values, opt.value])
            }
            className={[
              "min-h-11 px-4 py-2 rounded-full border font-sans text-sm cursor-pointer",
              "transition-all duration-200 ease-out active:scale-[0.98]",
              "motion-reduce:transition-none motion-reduce:active:scale-100",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridiana-yellow-hover",
              selected
                ? "bg-meridiana-yellow border-meridiana-yellow text-meridiana-black font-semibold shadow-sm"
                : "bg-meridiana-cream-light border-meridiana-border-light text-meridiana-text-secondary font-medium hover:border-meridiana-border-medium",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── preventivi ─────────────────────────────────────────────────────────────────

interface PreventivoDraft {
  kwp: string;
  prezzo: string;
  iva: "si" | "no";
  batteria: string;
  produzione: string;
}

const EMPTY_PREVENTIVO: PreventivoDraft = {
  kwp: "",
  prezzo: "",
  iva: "si",
  batteria: "",
  produzione: "",
};

// Accepts "4,5", "4.5", "8900", "8.900" and "1.234,5". A dot followed by
// exactly three digits is a thousands separator, as Italians write prices.
function num(s: string): number {
  let t = s.trim().replace(/\s/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return /^\d*\.?\d+$/.test(t) ? parseFloat(t) : NaN;
}

function preventivoValido(p: PreventivoDraft): boolean {
  const kwp = num(p.kwp);
  const prezzo = num(p.prezzo);
  return kwp > 0 && kwp <= 20 && prezzo > 0 && prezzo <= 200_000;
}

function toPreventivoInput(p: PreventivoDraft, i: number): PreventivoInput {
  const batteria = num(p.batteria);
  const produzione = num(p.produzione);
  const out: PreventivoInput = {
    etichetta: `Preventivo ${String.fromCharCode(65 + i)}`,
    kwp: num(p.kwp),
    prezzo_totale_eur: num(p.prezzo),
    prezzo_iva_inclusa: p.iva === "si",
    batteria_kwh: batteria > 0 ? batteria : 0,
  };
  if (produzione > 0) out.produzione_promessa_kwh = produzione;
  return out;
}

// ── page component ─────────────────────────────────────────────────────────────

// Reads the stima answers after hydration and (re)mounts the form with them.
export default function AnalisiCasaForm() {
  const raw = usePrefillRaw();
  return <Form key={raw ?? "vuoto"} prefill={parsePrefill(raw)} />;
}

function Form({ prefill }: { prefill: CasaPrefill | null }) {
  const uid = useId();
  const p: Partial<CasaEstimateRequest> = prefill?.request ?? {};
  const bool = (v: boolean | undefined) => (v === undefined ? null : v ? "si" : "no");

  // anti-spam time-trap: when the form was first shown
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // 01 — la casa
  const [comune, setComune] = useState<ComuneSelection | null>(
    p.comune && p.provincia ? { nome: p.comune, provincia: p.provincia } : null,
  );
  const [indirizzo, setIndirizzo] = useState("");
  const [tipo, setTipo] = useState<CasaTipoAbitazione | null>(p.tipo_abitazione ?? null);
  const [principale, setPrincipale] = useState<string | null>(bool(p.abitazione_principale));

  // 02 — consumi
  const [bolletta, setBolletta] = useState(p.bolletta_kwh ? String(p.bolletta_kwh) : "");
  const [nPersone, setNPersone] = useState<string | null>(
    p.n_occupants ? (p.n_occupants >= 6 ? "6+" : String(p.n_occupants)) : null,
  );
  const [superficie, setSuperficie] = useState(
    p.floor_area_m2 && !prefill?.superficieDaFascia ? String(p.floor_area_m2) : "",
  );
  const [presenza, setPresenza] = useState<CasaPresenzaDiurna | null>(p.presenza_diurna ?? null);
  const [riscaldamento, setRiscaldamento] = useState<string | null>(bool(p.riscaldamento_elettrico));
  const [acquaCalda, setAcquaCalda] = useState<string | null>(bool(p.acqua_calda_elettrica));
  const [terminali, setTerminali] = useState<string | null>(p.terminali ?? null);
  const [gas, setGas] = useState(p.gas_smc_annui ? String(p.gas_smc_annui) : "");
  const [gasEstivo, setGasEstivo] = useState(
    p.gas_smc_estivi_mese ? String(p.gas_smc_estivi_mese) : "",
  );

  // 03 — tetto e ombre
  const [orientamento, setOrientamento] = useState<CasaOrientamento | null>(
    p.orientamento && p.orientamento !== "est_o_ovest" ? p.orientamento : null,
  );
  const [ostacoli, setOstacoli] = useState<CasaOmbraOstacoli | null>(null);
  const [lati, setLati] = useState<CasaOmbraLato[]>([]);
  const [durata, setDurata] = useState<CasaOmbraDurata | null>(null);

  // 04 — detrazione
  const [irpef, setIrpef] = useState(p.irpef_annua_stimata ? String(p.irpef_annua_stimata) : "");

  // 05 — preventivi
  const [haPreventivi, setHaPreventivi] = useState<string | null>(null);
  const [preventivi, setPreventivi] = useState<PreventivoDraft[]>([{ ...EMPTY_PREVENTIVO }]);

  // 06 — contatti
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [note, setNote] = useState("");
  const [consenso, setConsenso] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  // ── completeness ──
  const bollettaKwh = num(bolletta);
  const superficieM2 = num(superficie);
  const ombraOk =
    ostacoli === "no" || ostacoli === "non_so" || (ostacoli === "si" && lati.length > 0 && durata !== null);
  const preventiviOk = haPreventivi === "no" || (haPreventivi === "si" && preventivi.every(preventivoValido));

  const mancanti: string[] = [];
  if (!comune) mancanti.push("comune");
  if (indirizzo.trim().length < 3) mancanti.push("indirizzo");
  if (!tipo) mancanti.push("tipo di abitazione");
  if (!principale) mancanti.push("abitazione principale");
  if (!(bollettaKwh >= 100 && bollettaKwh <= 20_000)) mancanti.push("consumo annuo");
  if (!nPersone) mancanti.push("persone in casa");
  if (!(superficieM2 >= 20 && superficieM2 <= 1_000)) mancanti.push("superficie");
  if (!presenza) mancanti.push("presenza di giorno");
  if (!riscaldamento || !acquaCalda) mancanti.push("riscaldamento e acqua calda");
  if (!orientamento) mancanti.push("orientamento del tetto");
  if (!ombraOk) mancanti.push("ombre");
  if (!preventiviOk) mancanti.push("preventivi");
  if (nome.trim().length === 0) mancanti.push("nome");
  if (!EMAIL_RE.test(email.trim())) mancanti.push("email");
  if (!consenso) mancanti.push("informativa privacy");
  const canSubmit = mancanti.length === 0 && status !== "sending";

  function buildStima(): CasaEstimateRequest & { bolletta_kwh: number } {
    const req: CasaEstimateRequest & { bolletta_kwh: number } = {
      comune: comune!.nome,
      provincia: comune!.provincia,
      n_occupants: nPersone === "6+" ? 6 : parseInt(nPersone!, 10),
      floor_area_m2: superficieM2,
      bolletta_kwh: bollettaKwh,
      presenza_diurna: presenza!,
      orientamento: orientamento!,
      abitazione_principale: principale === "si",
      tipo_abitazione: tipo!,
      riscaldamento_elettrico: riscaldamento === "si",
      acqua_calda_elettrica: acquaCalda === "si",
      ombra_ostacoli: ostacoli!,
      report: true,
    };
    if (ostacoli === "si") {
      req.ombra_lati = lati;
      req.ombra_durata = durata!;
    }
    const irpefN = num(irpef);
    if (irpefN > 0) req.irpef_annua_stimata = irpefN;
    if (terminali) req.terminali = terminali;
    const gasN = num(gas);
    if (gasN > 0) req.gas_smc_annui = gasN;
    const gasEstN = num(gasEstivo);
    if (gasEstN > 0) req.gas_smc_estivi_mese = gasEstN;
    if (haPreventivi === "si") req.preventivi = preventivi.map(toPreventivoInput);
    return req;
  }

  async function submit() {
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const res = await postAnalisiCasa({
        nome: nome.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        indirizzo: indirizzo.trim(),
        note: note.trim() || undefined,
        consenso_privacy: true,
        stima: buildStima(),
        website,
        opened_at: openedAt.current,
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  function updatePreventivo(i: number, patch: Partial<PreventivoDraft>) {
    setPreventivi((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  // Comuni dataset — lazy loaded, same file as /casa/stima
  const [comuni, setComuni] = useState<ComuneEntry[] | null>(null);
  const [comuniError, setComuniError] = useState(false);
  useEffect(() => {
    fetch("/data/comuni.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setComuni)
      .catch(() => setComuniError(true));
  }, []);

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(26,22,18,0.06)] border-2 border-meridiana-green text-center">
        <p
          aria-hidden
          className="mx-auto w-12 h-12 rounded-full bg-meridiana-green text-white text-2xl leading-12 font-sans"
        >
          ✓
        </p>
        <h2 className="font-sans text-lg font-semibold text-meridiana-green mt-4">
          Richiesta inviata.
        </h2>
        <p className="font-sans text-sm md:text-base text-meridiana-text-secondary mt-1 leading-relaxed">
          Controllo i dati e la foto aerea del tuo tetto, poi ti scrivo
          all&apos;indirizzo email che hai indicato.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
      noValidate
    >
      {prefill && (
        <p className="font-sans text-sm text-meridiana-text-secondary bg-meridiana-cream-light rounded-xl px-4 py-3">
          Abbiamo ripreso le risposte che hai dato nella stima. Controllale e
          completa quelle che mancano.
        </p>
      )}

      {/* ── 01 La casa ─────────────────────────────────────────────── */}
      <SectionTitle n={1} title="La casa" />
      <FieldCard label="Comune">
        <ComuneAutocomplete
          comuni={comuni}
          loadError={comuniError}
          selection={comune}
          onSelect={setComune}
        />
      </FieldCard>
      <FieldCard
        label="Indirizzo"
        hint="Via e numero civico: ci serve per trovare il tuo tetto sulla foto aerea."
      >
        <input
          id={`${uid}-indirizzo`}
          type="text"
          autoComplete="street-address"
          aria-label="Indirizzo"
          placeholder="Es. Via Roma 12"
          value={indirizzo}
          onChange={(e) => setIndirizzo(e.target.value)}
          className={inputClass}
        />
      </FieldCard>

      {/* Map slot: the aerial-photo map (MapLibre + AGEA) will replace this */}
      <section
        aria-label="Mappa del tetto (in arrivo)"
        className="rounded-2xl border-2 border-dashed border-meridiana-border-medium bg-meridiana-cream-light p-6 md:p-8 text-center"
      >
        <p className="font-sans text-sm font-semibold text-meridiana-text-secondary">
          Qui potrai indicare il tuo tetto sulla foto aerea
        </p>
        <p className="font-sans text-xs text-meridiana-text-tertiary mt-1 leading-relaxed">
          In arrivo. Per ora ci basta l&apos;indirizzo: il tetto lo individuiamo
          noi durante la revisione.
        </p>
      </section>

      <FieldCard label="Che tipo di abitazione è?">
        <Pills name="Tipo di abitazione" options={TIPO} value={tipo} onChange={setTipo} />
      </FieldCard>
      <FieldCard
        label="È la tua abitazione principale?"
        hint="Cambia l'aliquota della detrazione: 50% per la principale, 36% per le altre."
      >
        <Pills
          name="Abitazione principale"
          options={SI_NO}
          value={principale}
          onChange={setPrincipale}
        />
      </FieldCard>

      {/* ── 02 Consumi ─────────────────────────────────────────────── */}
      <SectionTitle
        n={2}
        title="I consumi"
        hint="Per l'analisi completa serve il consumo vero, dalla bolletta."
      />
      <FieldCard label="Dati della casa">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            id={`${uid}-bolletta`}
            label="Consumo annuo (kWh)"
            hint="In bolletta come 'consumo annuo' o 'consumi degli ultimi 12 mesi'."
            placeholder="Es. 2400"
            value={bolletta}
            onChange={setBolletta}
          />
          <NumberField
            id={`${uid}-superficie`}
            label="Superficie (m²)"
            hint="Superficie calpestabile, anche approssimata."
            placeholder="Es. 110"
            value={superficie}
            onChange={setSuperficie}
          />
        </div>
      </FieldCard>
      <FieldCard label="Quante persone vivono in casa?">
        <Pills name="Persone" options={N_PERSONE} value={nPersone} onChange={setNPersone} />
      </FieldCard>
      <FieldCard
        label="Durante il giorno la casa è…"
        hint="Influisce su quanta energia usi mentre il sole produce."
      >
        <Pills name="Presenza diurna" options={PRESENZA} value={presenza} onChange={setPresenza} />
      </FieldCard>
      <FieldCard label="Riscaldamento e acqua calda">
        <div className="space-y-4">
          <div>
            <p className={labelClass}>Riscaldamento elettrico (pompa di calore o stufe)?</p>
            <Pills
              name="Riscaldamento elettrico"
              options={SI_NO}
              value={riscaldamento}
              onChange={setRiscaldamento}
            />
          </div>
          <div>
            <p className={labelClass}>Acqua calda elettrica (boiler o pompa di calore)?</p>
            <Pills
              name="Acqua calda elettrica"
              options={SI_NO}
              value={acquaCalda}
              onChange={setAcquaCalda}
            />
          </div>
          {riscaldamento === "no" && (
            <div className="space-y-4 border-t border-meridiana-border-light pt-4">
              <p className="font-sans text-xs text-meridiana-text-tertiary leading-relaxed">
                Facoltativo: con questi dati stimiamo anche quanto cambierebbe
                il fotovoltaico passando a una pompa di calore.
              </p>
              <div>
                <p className={labelClass}>Terminali di riscaldamento</p>
                <Pills
                  name="Terminali"
                  options={TERMINALI}
                  value={terminali}
                  onChange={setTerminali}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField
                  id={`${uid}-gas`}
                  label="Gas in un anno (Smc)"
                  placeholder="Es. 1200"
                  value={gas}
                  onChange={setGas}
                />
                <NumberField
                  id={`${uid}-gas-estivo`}
                  label="Gas in un mese estivo (Smc)"
                  placeholder="Es. 20"
                  value={gasEstivo}
                  onChange={setGasEstivo}
                />
              </div>
            </div>
          )}
        </div>
      </FieldCard>

      {/* ── 03 Tetto e ombre ───────────────────────────────────────── */}
      <SectionTitle n={3} title="Il tetto e le ombre" />
      <FieldCard label="Dove guarda il tetto?">
        <Pills
          name="Orientamento"
          options={ORIENTAMENTO}
          value={orientamento}
          onChange={setOrientamento}
        />
      </FieldCard>
      <FieldCard
        label="Ci sono alberi o edifici più alti del tuo tetto, entro una ventina di metri?"
        hint="Comignoli e antenne non contano: li consideriamo già."
      >
        <Pills name="Ostacoli" options={OSTACOLI} value={ostacoli} onChange={setOstacoli} />
        {ostacoli === "si" && (
          <div className="space-y-4 mt-4 border-t border-meridiana-border-light pt-4">
            <div>
              <p className={labelClass}>Da che lato? (anche più di uno)</p>
              <MultiPills name="Lati" options={LATI} values={lati} onChange={setLati} />
            </div>
            <div>
              <p className={labelClass}>Quanto fanno ombra sul tetto?</p>
              <Pills name="Durata ombra" options={DURATA} value={durata} onChange={setDurata} />
            </div>
          </div>
        )}
      </FieldCard>

      {/* ── 04 Detrazione ──────────────────────────────────────────── */}
      <SectionTitle n={4} title="La detrazione" />
      <FieldCard
        label="IRPEF lorda annua (€), facoltativo"
        hint="Dalla dichiarazione dei redditi. Serve a capire se recuperi tutta la detrazione: la parte oltre l'IRPEF di ogni anno si perde."
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="IRPEF lorda annua"
          placeholder="Es. 6000"
          value={irpef}
          onChange={(e) => setIrpef(e.target.value)}
          className={inputClass}
        />
      </FieldCard>

      {/* ── 05 Preventivi ──────────────────────────────────────────── */}
      <SectionTitle
        n={5}
        title="I preventivi"
        hint="Solo i numeri: non serve caricare documenti. Li simuliamo con i tuoi consumi e il tuo tetto."
      />
      <FieldCard label="Hai già ricevuto dei preventivi?">
        <Pills
          name="Preventivi ricevuti"
          options={SI_NO}
          value={haPreventivi}
          onChange={setHaPreventivi}
        />
      </FieldCard>
      {haPreventivi === "si" &&
        preventivi.map((pv, i) => (
          <FieldCard key={i} label={`Preventivo ${String.fromCharCode(65 + i)}`} secondary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField
                id={`${uid}-pv${i}-kwp`}
                label="Potenza (kWp)"
                placeholder="Es. 4,5"
                value={pv.kwp}
                onChange={(v) => updatePreventivo(i, { kwp: v })}
              />
              <NumberField
                id={`${uid}-pv${i}-prezzo`}
                label="Prezzo totale (€)"
                placeholder="Es. 9500"
                value={pv.prezzo}
                onChange={(v) => updatePreventivo(i, { prezzo: v })}
              />
              <NumberField
                id={`${uid}-pv${i}-batteria`}
                label="Batteria (kWh), se c'è"
                placeholder="Es. 5"
                value={pv.batteria}
                onChange={(v) => updatePreventivo(i, { batteria: v })}
              />
              <NumberField
                id={`${uid}-pv${i}-produzione`}
                label="Produzione promessa (kWh/anno)"
                placeholder="Se indicata"
                value={pv.produzione}
                onChange={(v) => updatePreventivo(i, { produzione: v })}
              />
            </div>
            <div className="mt-4">
              <p className={labelClass}>Il prezzo comprende l&apos;IVA?</p>
              <Pills
                name={`IVA preventivo ${i + 1}`}
                options={SI_NO}
                value={pv.iva}
                onChange={(v) => updatePreventivo(i, { iva: v as "si" | "no" })}
              />
            </div>
            {preventivi.length > 1 && (
              <button
                type="button"
                onClick={() => setPreventivi((l) => l.filter((_, j) => j !== i))}
                className="mt-4 font-sans text-sm text-meridiana-text-tertiary underline underline-offset-2 hover:text-meridiana-text-secondary cursor-pointer"
              >
                Rimuovi
              </button>
            )}
          </FieldCard>
        ))}
      {haPreventivi === "si" && preventivi.length < MAX_PREVENTIVI && (
        <button
          type="button"
          onClick={() => setPreventivi((l) => [...l, { ...EMPTY_PREVENTIVO }])}
          className="w-full min-h-12 rounded-xl border border-dashed border-meridiana-border-medium font-sans text-sm font-semibold text-meridiana-text-secondary hover:bg-meridiana-cream-light cursor-pointer"
        >
          + Aggiungi un altro preventivo
        </button>
      )}

      {/* ── 06 Contatti ────────────────────────────────────────────── */}
      <SectionTitle n={6} title="Come ti ricontatto" />
      <FieldCard label="I tuoi dati">
        <div className="space-y-4">
          <div>
            <label htmlFor={`${uid}-nome`} className={labelClass}>
              Nome e cognome
            </label>
            <input
              id={`${uid}-nome`}
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${uid}-email`} className={labelClass}>
                Email
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                autoComplete="email"
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-tel`} className={labelClass}>
                Telefono (facoltativo)
              </label>
              <input
                id={`${uid}-tel`}
                type="tel"
                autoComplete="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor={`${uid}-note`} className={labelClass}>
              Note (facoltativo)
            </label>
            <textarea
              id={`${uid}-note`}
              rows={3}
              maxLength={2000}
              placeholder="Lavori in programma, un'auto elettrica in arrivo, dubbi…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      </FieldCard>

      <label className="flex items-start gap-3 px-1 cursor-pointer">
        <input
          type="checkbox"
          checked={consenso}
          onChange={(e) => setConsenso(e.target.checked)}
          className="mt-1 w-5 h-5 accent-meridiana-yellow shrink-0"
        />
        <span className="font-sans text-sm text-meridiana-text-secondary leading-relaxed">
          Ho letto l&apos;
          <a
            href="/privacy"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2 hover:text-meridiana-black"
          >
            informativa sulla privacy
          </a>{" "}
          e chiedo l&apos;analisi della mia casa.
        </span>
      </label>

      {/* Honeypot: off-screen, out of tab order. Humans never see it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="font-sans text-sm text-meridiana-red text-center">
          Non siamo riusciti a inviare la richiesta. Riprova tra poco: i dati
          inseriti sono ancora qui.
        </p>
      )}

      <div className="sticky bottom-0 z-20 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-meridiana-cream via-meridiana-cream/95 to-transparent md:static md:bg-none md:pb-0">
        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            "w-full min-h-14 rounded-xl font-sans font-semibold text-base md:text-lg",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridiana-yellow-hover",
            canSubmit
              ? "bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black shadow-sm hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100 cursor-pointer"
              : "bg-meridiana-yellow/40 text-meridiana-black/40 cursor-not-allowed",
          ].join(" ")}
        >
          {status === "sending" ? "Invio in corso…" : "Invia la richiesta"}
        </button>
        {mancanti.length > 0 && status !== "sending" && (
          <p className="font-sans text-xs text-meridiana-text-tertiary text-center mt-2">
            Manca ancora: {mancanti.join(", ")}.
          </p>
        )}
      </div>
    </form>
  );
}
