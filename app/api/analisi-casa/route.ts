import { after } from "next/server";
import { Resend } from "resend";
import { env } from "@/lib/env";
import type {
  AnalisiCasaRequest,
  CasaEstimateRequest,
  PreventivoInput,
} from "@/lib/types";

// Livello 2 request for a house (/casa/analisi).
//
// 1. Validates and filters spam (honeypot + time-trap, fake success to bots).
// 2. Mails the request to Sirot right away (so nothing is lost if the engine
//    is slow or down) — the user gets the confirmation after this step.
// 3. After the response, runs the engine with report=true and mails the
//    numbers with the full JSON attached. Sirot reviews before replying.
//
// Minimisation (GDPR art. 5): the engine receives only technical data,
// rebuilt field by field below — never name, email, phone or address.

export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FORM_TIME_MS = 3_000;
const ENGINE_TIMEOUT_MS = 45_000;

const PRESENZA = ["per_lo_piu_vuota", "spesso_occupata"] as const;
const ORIENTAMENTO = ["sud", "sud_est_sud_ovest", "est", "ovest", "nord", "non_so"] as const;
const TIPO = ["casa", "appartamento"] as const;
const OSTACOLI = ["no", "si", "non_so"] as const;
const LATI = ["sud", "est", "ovest"] as const;
const DURATA = ["qualche_ora", "buona_parte"] as const;
const TERMINALI = ["termosifoni", "pavimento_radiante", "ventilconvettori", "non_so"] as const;

function ok(): Response {
  return Response.json({ ok: true });
}

function fail(status: number): Response {
  return Response.json(
    { ok: false, message: "Non è stato possibile inviare la richiesta." },
    { status },
  );
}

// ── validation ────────────────────────────────────────────────────────────────

function str(v: unknown, max: number, min = 1): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}

function optStr(v: unknown, max: number): string | undefined | null {
  if (v === undefined || v === null || v === "") return undefined;
  return str(v, max);
}

function numIn(v: unknown, lo: number, hi: number): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi ? v : null;
}

function oneOf<T extends string>(v: unknown, list: readonly T[]): T | null {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : null;
}

class Invalid extends Error {}

function need<T>(v: T | null | undefined): T {
  if (v === null || v === undefined) throw new Invalid();
  return v;
}

function bool(v: unknown): boolean {
  if (typeof v !== "boolean") throw new Invalid();
  return v;
}

function parsePreventivo(raw: unknown, i: number): PreventivoInput {
  if (typeof raw !== "object" || raw === null) throw new Invalid();
  const p = raw as Record<string, unknown>;
  const out: PreventivoInput = {
    etichetta: `Preventivo ${String.fromCharCode(65 + i)}`,
    kwp: need(numIn(p.kwp, 0.1, 20)),
    prezzo_totale_eur: need(numIn(p.prezzo_totale_eur, 1, 200_000)),
    prezzo_iva_inclusa: bool(p.prezzo_iva_inclusa),
    batteria_kwh: need(numIn(p.batteria_kwh ?? 0, 0, 40)),
  };
  if (p.produzione_promessa_kwh !== undefined)
    out.produzione_promessa_kwh = need(numIn(p.produzione_promessa_kwh, 1, 100_000));
  return out;
}

// Rebuilds the engine request from allowed fields only.
function parseStima(raw: unknown): CasaEstimateRequest & { bolletta_kwh: number } {
  if (typeof raw !== "object" || raw === null) throw new Invalid();
  const s = raw as Record<string, unknown>;
  const req: CasaEstimateRequest & { bolletta_kwh: number } = {
    comune: need(str(s.comune, 120, 2)),
    provincia: need(str(s.provincia, 2, 2)),
    n_occupants: need(numIn(s.n_occupants, 1, 10)),
    floor_area_m2: need(numIn(s.floor_area_m2, 20, 1_000)),
    bolletta_kwh: need(numIn(s.bolletta_kwh, 100, 20_000)),
    presenza_diurna: need(oneOf(s.presenza_diurna, PRESENZA)),
    orientamento: need(oneOf(s.orientamento, ORIENTAMENTO)),
    abitazione_principale: bool(s.abitazione_principale),
    tipo_abitazione: need(oneOf(s.tipo_abitazione, TIPO)),
    riscaldamento_elettrico: bool(s.riscaldamento_elettrico),
    acqua_calda_elettrica: bool(s.acqua_calda_elettrica),
    ombra_ostacoli: need(oneOf(s.ombra_ostacoli, OSTACOLI)),
    report: true,
  };
  if (!Number.isInteger(req.n_occupants)) throw new Invalid();
  if (req.ombra_ostacoli === "si") {
    if (!Array.isArray(s.ombra_lati) || s.ombra_lati.length === 0) throw new Invalid();
    req.ombra_lati = [...new Set(s.ombra_lati.map((l) => need(oneOf(l, LATI))))];
    req.ombra_durata = need(oneOf(s.ombra_durata, DURATA));
  }
  if (s.irpef_annua_stimata !== undefined)
    req.irpef_annua_stimata = need(numIn(s.irpef_annua_stimata, 0, 1_000_000));
  if (s.terminali !== undefined) req.terminali = need(oneOf(s.terminali, TERMINALI));
  if (s.gas_smc_annui !== undefined) req.gas_smc_annui = need(numIn(s.gas_smc_annui, 0, 10_000));
  if (s.gas_smc_estivi_mese !== undefined)
    req.gas_smc_estivi_mese = need(numIn(s.gas_smc_estivi_mese, 0, 500));
  if (s.preventivi !== undefined) {
    if (!Array.isArray(s.preventivi) || s.preventivi.length > 3) throw new Invalid();
    req.preventivi = s.preventivi.map(parsePreventivo);
  }
  return req;
}

function validate(body: Record<string, unknown>): AnalisiCasaRequest | null {
  try {
    if (body.consenso_privacy !== true) return null;
    const email = need(str(body.email, 320));
    if (!EMAIL_RE.test(email)) return null;
    const telefono = optStr(body.telefono, 50);
    const note = optStr(body.note, 2000);
    if (telefono === null || note === null) return null;
    return {
      nome: need(str(body.nome, 200)),
      email,
      telefono,
      indirizzo: need(str(body.indirizzo, 200, 3)),
      note,
      consenso_privacy: true,
      stima: parseStima(body.stima),
      website: "",
      opened_at: body.opened_at as number,
    };
  } catch (e) {
    if (e instanceof Invalid) return null;
    throw e;
  }
}

// ── formatting ────────────────────────────────────────────────────────────────

// Italian format with the thousands dot always on (Intl it-IT leaves 4-digit
// numbers ungrouped: "8900" next to "14.000" reads badly in a table).
function fmt(v: number, maxDec: number): string {
  const [int, dec] = Math.abs(v).toFixed(maxDec).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const d = dec?.replace(/0+$/, "");
  return (v < 0 ? "-" : "") + grouped + (d ? `,${d}` : "");
}
const nf0 = { format: (v: number) => fmt(v, 0) };
const nf1 = { format: (v: number) => fmt(v, 1) };
const eur = (v: number) => `${v < 0 ? "−" : ""}€${nf0.format(Math.abs(v))}`;
const anni = (v: number) => (v >= 99 ? "non rientra in 25 anni" : `${nf1.format(v)} anni`);
const siNo = (v: boolean | undefined) => (v ? "sì" : "no");

const LABEL: Record<string, string> = {
  per_lo_piu_vuota: "per lo più vuota",
  spesso_occupata: "spesso occupata",
  sud_est_sud_ovest: "sud-est o sud-ovest",
  non_so: "non so",
  casa: "casa indipendente o a schiera",
  appartamento: "appartamento in condominio",
  qualche_ora: "qualche ora",
  buona_parte: "buona parte del giorno",
  pavimento_radiante: "pavimento radiante",
};
const lab = (v: string | undefined) => (v ? (LABEL[v] ?? v) : "—");

function preventiviLines(list: PreventivoInput[] | undefined): string[] {
  if (!list?.length) return ["Nessun preventivo indicato."];
  return list.map(
    (p) =>
      `${p.etichetta}: ${nf1.format(p.kwp)} kWp, ${eur(p.prezzo_totale_eur)} ` +
      `(${p.prezzo_iva_inclusa ? "IVA inclusa" : "IVA esclusa"})` +
      (p.batteria_kwh > 0 ? `, batteria ${nf1.format(p.batteria_kwh)} kWh` : "") +
      (p.produzione_promessa_kwh ? `, produzione promessa ${nf0.format(p.produzione_promessa_kwh)} kWh/anno` : ""),
  );
}

function requestEmail(r: AnalisiCasaRequest): string {
  const s = r.stima;
  const ombra =
    s.ombra_ostacoli === "si"
      ? `sì, lato ${s.ombra_lati?.join(" + ")}, ${lab(s.ombra_durata)}`
      : lab(s.ombra_ostacoli);
  return [
    "Nuova richiesta di analisi completa (casa) dal sito Meridiana.",
    "Il report del motore arriva in una seconda mail tra poco.",
    "",
    "── Richiedente ─────────────────────────────",
    `Nome:       ${r.nome}`,
    `Email:      ${r.email}`,
    `Telefono:   ${r.telefono ?? "—"}`,
    `Indirizzo:  ${r.indirizzo}, ${s.comune} (${s.provincia})`,
    "",
    "── Note ────────────────────────────────────",
    r.note ?? "—",
    "",
    "── Casa e consumi ──────────────────────────",
    `Tipo:                 ${lab(s.tipo_abitazione)}`,
    `Abitazione principale: ${siNo(s.abitazione_principale)}`,
    `Consumo (bolletta):   ${nf0.format(s.bolletta_kwh)} kWh/anno`,
    `Persone / superficie: ${s.n_occupants} / ${nf0.format(s.floor_area_m2)} m²`,
    `Di giorno la casa è:  ${lab(s.presenza_diurna)}`,
    `Riscaldamento elettr.: ${siNo(s.riscaldamento_elettrico)}; acqua calda elettrica: ${siNo(s.acqua_calda_elettrica)}`,
    `Gas:                  ${s.gas_smc_annui ? `${nf0.format(s.gas_smc_annui)} Smc/anno` : "—"}` +
      (s.gas_smc_estivi_mese ? `, ${nf0.format(s.gas_smc_estivi_mese)} Smc in un mese estivo` : "") +
      (s.terminali ? `, terminali: ${lab(s.terminali)}` : ""),
    `IRPEF lorda annua:    ${s.irpef_annua_stimata !== undefined ? eur(s.irpef_annua_stimata) : "—"}`,
    "",
    "── Tetto ───────────────────────────────────",
    `Orientamento:         ${lab(s.orientamento)}`,
    `Ombre vicine:         ${ombra}`,
    "",
    "── Preventivi ──────────────────────────────",
    ...preventiviLines(s.preventivi),
  ].join("\n");
}

// Minimal view of the engine response (only what the summary prints).
interface EngineScenario {
  capex_eur: number;
  npv_eur: number;
  payback_anni: number;
  autosufficienza_pct: number;
}
interface EngineResponse {
  kwp_ipotizzato: number;
  produzione_annua_kwh: number;
  co2_evitata_kg_anno: number;
  senza_batteria: EngineScenario;
  con_batteria: EngineScenario & { battery_kwh: number };
  verdetto_pv: { etichetta: string; testo: string };
  ombra?: { descrizione: string; perdita_pct: number; da_verificare: boolean } | null;
  tetto_rilevato?: unknown;
  report?: {
    sensibilita: { leva: string; variante: string; base: boolean; npv_eur: number; payback_anni: number }[];
    co2: { t_totale: number; anni: number };
    preventivi: {
      etichetta: string;
      kwp: number;
      prezzo_iva_inclusa_eur: number;
      npv_eur: number;
      payback_anni: number;
      etichetta_verdetto: string;
      nota: string;
    }[];
  } | null;
}

const LEVA: Record<string, string> = {
  tasso: "Tasso di sconto",
  prezzo_cessione: "Prezzo di cessione",
  prezzo_acquisto: "Prezzo della luce",
  detrazione: "Detrazione",
  costo: "Costo impianto",
};

function reportEmail(r: AnalisiCasaRequest, e: EngineResponse): string {
  const sb = e.senza_batteria;
  const cb = e.con_batteria;
  const lines = [
    `Report del motore per ${r.nome} — ${r.indirizzo}, ${r.stima.comune}.`,
    "Numeri automatici da rivedere prima di rispondere. JSON completi in allegato.",
    "",
    "── Esito (taglia scelta dal motore) ────────",
    `Impianto:        ${nf1.format(e.kwp_ipotizzato)} kWp, ${eur(sb.capex_eur)}`,
    `Produzione:      ${nf0.format(e.produzione_annua_kwh)} kWh/anno`,
    `Verdetto:        ${e.verdetto_pv.etichetta}`,
    `Senza batteria:  NPV ${eur(sb.npv_eur)}, rientro ${anni(sb.payback_anni)}, autosufficienza ${nf0.format(sb.autosufficienza_pct)}%`,
    `Con batteria ${nf0.format(cb.battery_kwh)} kWh: NPV ${eur(cb.npv_eur)}, rientro ${anni(cb.payback_anni)}, autosufficienza ${nf0.format(cb.autosufficienza_pct)}%`,
    `CO₂ evitata:     ${nf0.format(e.co2_evitata_kg_anno)} kg/anno` +
      (e.report ? ` (${nf1.format(e.report.co2.t_totale)} t in ${e.report.co2.anni} anni)` : ""),
    "",
    e.verdetto_pv.testo,
  ];
  if (e.ombra) {
    lines.push(
      "",
      "── Ombre ───────────────────────────────────",
      `${e.ombra.descrizione}: perdita ${nf1.format(e.ombra.perdita_pct)}%` +
        (e.ombra.da_verificare ? " — DA VERIFICARE sulla foto aerea" : ""),
    );
  }
  if (e.report) {
    lines.push("", "── Sensibilità (una leva alla volta, senza batteria) ──");
    for (const v of e.report.sensibilita) {
      lines.push(
        `${(LEVA[v.leva] ?? v.leva).padEnd(20)} ${v.variante.padEnd(34)} NPV ${eur(v.npv_eur).padStart(8)}  rientro ${anni(v.payback_anni)}${v.base ? "  ← stima" : ""}`,
      );
    }
    if (e.report.preventivi.length) {
      lines.push("", "── Preventivi simulati con i suoi consumi ──");
      for (const p of e.report.preventivi) {
        lines.push(
          `${p.etichetta}: ${nf1.format(p.kwp)} kWp a ${eur(p.prezzo_iva_inclusa_eur)} → ${p.etichetta_verdetto}, NPV ${eur(p.npv_eur)}, rientro ${anni(p.payback_anni)}`,
          `   ${p.nota}`,
        );
      }
    }
  }
  return lines.join("\n");
}

// ── handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400);
  }

  // Honeypot and time-trap: same mechanism as /api/lead, fake success to bots
  if (typeof body.website === "string" && body.website.length > 0) return ok();
  const openedAt = body.opened_at;
  if (typeof openedAt !== "number" || Date.now() - openedAt < MIN_FORM_TIME_MS) return ok();

  const req = validate(body);
  if (!req) return fail(400);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    console.error("analisi-casa: RESEND_API_KEY / LEAD_NOTIFICATION_EMAIL not set");
    return fail(502);
  }
  const resend = new Resend(apiKey);
  const from = "Meridiana <onboarding@resend.dev>";
  const luogo = `${req.stima.comune} (${req.stima.provincia})`;

  // 1. The request itself — must succeed before we confirm to the user
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: req.email,
      subject: `Richiesta analisi casa — ${luogo}`,
      text: requestEmail(req),
    });
    if (error) {
      console.error("analisi-casa: Resend error", error);
      return fail(502);
    }
  } catch (e) {
    console.error("analisi-casa: Resend exception", e);
    return fail(502);
  }

  // 2. Engine report, after the response (the user does not wait for it)
  after(async () => {
    const engineReq = JSON.stringify(req.stima, null, 2);
    let text: string;
    let risposta: string | null = null;
    try {
      const res = await fetch(`${env.apiUrl}/estimate/casa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: engineReq,
        signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
      });
      const raw = await res.text();
      if (res.ok) {
        risposta = raw;
        text = reportEmail(req, JSON.parse(raw) as EngineResponse);
      } else {
        text =
          `Il motore ha risposto ${res.status}: nessun report automatico.\n` +
          `Ricalcola a mano con richiesta-motore.json (allegato).\n\n${raw.slice(0, 2000)}`;
      }
    } catch (e) {
      text =
        `Il motore non ha risposto (${e instanceof Error ? e.message : String(e)}).\n` +
        "Ricalcola a mano con richiesta-motore.json (allegato).";
    }
    const attachments = [
      { filename: "richiesta-motore.json", content: Buffer.from(engineReq) },
      ...(risposta ? [{ filename: "risposta-motore.json", content: Buffer.from(risposta) }] : []),
    ];
    try {
      const { error } = await resend.emails.send({
        from,
        to,
        subject: `Report motore — ${luogo} — ${req.nome}`,
        text,
        attachments,
      });
      if (error) console.error("analisi-casa: Resend error (report)", error);
    } catch (e) {
      console.error("analisi-casa: Resend exception (report)", e);
    }
  });

  return ok();
}
