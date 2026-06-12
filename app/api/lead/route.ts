import { Resend } from "resend";
import { LEAD_RUOLI, type LeadRequest, type LeadRuolo } from "@/lib/types";

// Lead intake for the Level-2 report request (/scuole/stima result view).
// Validates, filters spam (honeypot + time-trap), then notifies via Resend.
// Spam is answered with a FAKE success so bots can't learn the mechanism.

const RUOLO_LABELS: Record<LeadRuolo, string> = {
  dirigente_scolastico: "Dirigente o personale scolastico",
  ente_locale: "Comune o ente locale",
  docente_genitore: "Docente o genitore",
  altro: "Altro",
};

// Pragmatic email shape check — real validation is Resend accepting replyTo
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_FORM_TIME_MS = 3_000;

function ok(): Response {
  return Response.json({ ok: true });
}

function fail(status: number): Response {
  return Response.json(
    { ok: false, message: "Non è stato possibile inviare la richiesta." },
    { status },
  );
}

function isStr(v: unknown, max: number, required = false): v is string {
  if (v === undefined || v === null || v === "")
    return !required && (v === undefined || v === "" || v === null);
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

function validate(body: Record<string, unknown>): LeadRequest | null {
  const stima = body.stima as Record<string, unknown> | undefined;
  const valid =
    isStr(body.nome, 200, true) &&
    isStr(body.email, 320, true) &&
    EMAIL_RE.test(body.email as string) &&
    LEAD_RUOLI.includes(body.ruolo as LeadRuolo) &&
    isStr(body.comune, 120, true) &&
    isStr(body.scuola, 200) &&
    isStr(body.telefono, 50) &&
    isStr(body.note, 2000) &&
    typeof stima === "object" &&
    stima !== null &&
    isStr(stima.comune, 120, true) &&
    isStr(stima.provincia, 10, true) &&
    isStr(stima.tipologia, 80, true) &&
    isStr(stima.fascia_studenti, 80, true) &&
    isStr(stima.fascia_anno, 80, true) &&
    typeof stima.kwp === "number" &&
    Number.isFinite(stima.kwp) &&
    isStr(stima.produzione, 80, true) &&
    isStr(stima.investimento, 80, true) &&
    isStr(stima.payback, 80, true);
  return valid ? (body as unknown as LeadRequest) : null;
}

function emailBody(lead: LeadRequest): string {
  const s = lead.stima;
  return [
    "Nuova richiesta di report completo dal sito Meridiana.",
    "",
    "── Richiedente ─────────────────────────────",
    `Nome:      ${lead.nome.trim()}`,
    `In qualità di: ${RUOLO_LABELS[lead.ruolo]}`,
    `Email:     ${lead.email.trim()}`,
    `Telefono:  ${lead.telefono?.trim() || "—"}`,
    `Comune:    ${lead.comune.trim()}`,
    `Scuola:    ${lead.scuola?.trim() || "—"}`,
    "",
    "── Note ────────────────────────────────────",
    lead.note?.trim() || "—",
    "",
    "── Stima preliminare mostrata ──────────────",
    `Comune:            ${s.comune} (${s.provincia})`,
    `Tipologia:         ${s.tipologia}`,
    `Studenti:          ${s.fascia_studenti}`,
    `Anno edificio:     ${s.fascia_anno}`,
    `Impianto:          ${s.kwp} kWp`,
    `Produzione:        ${s.produzione}`,
    `Investimento:      ${s.investimento}`,
    `Tempo di rientro:  ${s.payback}`,
  ].join("\n");
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400);
  }

  // Honeypot: hidden field a human can't see. Filled → bot → fake success.
  if (typeof body.website === "string" && body.website.length > 0) return ok();

  // Time-trap: humans take longer than 3s from opening the form to submit.
  // Missing/invalid timestamp means the form was bypassed → same fake success.
  const openedAt = body.opened_at;
  if (typeof openedAt !== "number" || Date.now() - openedAt < MIN_FORM_TIME_MS)
    return ok();

  const lead = validate(body);
  if (!lead) return fail(400);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    console.error("lead: RESEND_API_KEY / LEAD_NOTIFICATION_EMAIL not set");
    return fail(502);
  }

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: "Meridiana <onboarding@resend.dev>",
      to,
      replyTo: lead.email.trim(),
      subject: `Nuova richiesta report — ${lead.comune.trim()}`,
      text: emailBody(lead),
    });
    if (error) {
      console.error("lead: Resend error", error);
      return fail(502);
    }
  } catch (e) {
    console.error("lead: Resend exception", e);
    return fail(502);
  }

  return ok();
}
