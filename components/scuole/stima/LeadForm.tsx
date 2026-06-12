"use client";

import { useId, useState } from "react";
import { postLead } from "@/lib/api";
import type { LeadRuolo, LeadStimaContext } from "@/lib/types";
import Pills from "./Pills";

// Level-2 lead card: tease copy + CTA that expands an inline form. On success
// the whole card becomes a green-accented confirmation. Entered data survives
// a failed submit so the visitor can simply retry.

const RUOLI: { value: LeadRuolo; label: string }[] = [
  { value: "dirigente_scolastico", label: "Dirigente o personale scolastico" },
  { value: "ente_locale", label: "Comune o ente locale" },
  { value: "docente_genitore", label: "Docente o genitore" },
  { value: "altro", label: "Altro" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = [
  "w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base",
  "bg-meridiana-cream-light border border-meridiana-border-light text-meridiana-black",
  "placeholder:text-meridiana-text-tertiary",
  "transition-colors duration-200 motion-reduce:transition-none",
  "focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40",
].join(" ");

function Field({
  id,
  label,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="block font-sans text-sm font-semibold text-meridiana-black"
      >
        {label}
        {optional && (
          <span className="font-normal text-meridiana-text-tertiary">
            {" "}
            (facoltativo)
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function LeadForm({ stima }: { stima: LeadStimaContext }) {
  const uid = useId();
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );

  const [nome, setNome] = useState("");
  const [ruolo, setRuolo] = useState<LeadRuolo | null>(null);
  const [comune, setComune] = useState(`${stima.comune} (${stima.provincia})`);
  const [scuola, setScuola] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const expanded = openedAt !== null;
  const canSubmit =
    nome.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    ruolo !== null &&
    comune.trim().length > 0 &&
    status !== "sending";

  async function submit() {
    if (!canSubmit || ruolo === null || openedAt === null) return;
    setStatus("sending");
    try {
      const res = await postLead({
        nome: nome.trim(),
        ruolo,
        comune: comune.trim(),
        scuola: scuola.trim() || undefined,
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        note: note.trim() || undefined,
        website,
        opened_at: openedAt,
        stima,
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(26,22,18,0.06)] border-2 border-meridiana-green text-center">
        <p
          aria-hidden
          className="mx-auto w-12 h-12 rounded-full bg-meridiana-green text-white text-2xl leading-12 font-sans"
        >
          ✓
        </p>
        <h3 className="font-sans text-lg font-semibold text-meridiana-green mt-4">
          Richiesta inviata.
        </h3>
        <p className="font-sans text-sm md:text-base text-meridiana-text-secondary mt-1">
          Ti scriviamo entro 48 ore.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-meridiana-cream-light rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(26,22,18,0.06)] text-center">
      <p className="font-sans text-sm md:text-base text-meridiana-text-secondary leading-relaxed max-w-lg mx-auto">
        Nel report completo: il beneficio economico anno per anno, la
        CO&#8322; evitata, il confronto tra tre taglie d&apos;impianto, la
        verifica della copertura, gli incentivi applicabili — in un documento
        da allegare in delibera.
      </p>

      {!expanded && (
        <button
          type="button"
          onClick={() => setOpenedAt(Date.now())}
          className="inline-block mt-6 w-full sm:w-auto sm:px-10 bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black font-sans font-semibold text-base px-6 py-4 rounded-xl shadow-sm transition-all duration-200 ease-out active:scale-[0.98] hover:shadow-md motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer"
        >
          Richiedi il report completo
        </button>
      )}

      {expanded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-6 space-y-4 max-w-lg mx-auto"
        >
          <Field id={`${uid}-nome`} label="Nome e cognome">
            <input
              id={`${uid}-nome`}
              type="text"
              autoComplete="name"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Maria Rossi"
              className={inputClass}
            />
          </Field>

          <div className="text-left">
            <p className="font-sans text-sm font-semibold text-meridiana-black">
              In qualità di
            </p>
            <div className="mt-2">
              <Pills
                name="In qualità di"
                options={RUOLI}
                value={ruolo}
                onChange={setRuolo}
              />
            </div>
          </div>

          <Field id={`${uid}-comune`} label="Comune">
            <input
              id={`${uid}-comune`}
              type="text"
              required
              value={comune}
              onChange={(e) => setComune(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field id={`${uid}-scuola`} label="Scuola" optional>
            <input
              id={`${uid}-scuola`}
              type="text"
              value={scuola}
              onChange={(e) => setScuola(e.target.value)}
              placeholder="Nome della scuola"
              className={inputClass}
            />
          </Field>

          <Field id={`${uid}-email`} label="Email">
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
              className={inputClass}
            />
          </Field>

          <Field id={`${uid}-telefono`} label="Telefono" optional>
            <input
              id={`${uid}-telefono`}
              type="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field id={`${uid}-note`} label="Note" optional>
            <textarea
              id={`${uid}-note`}
              rows={3}
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Domande o dettagli utili sull'edificio"
              className={`${inputClass} resize-y`}
            />
          </Field>

          {/* Honeypot: off-screen (not display:none — too recognizable),
              out of tab order, ignored by autofill. Humans never see it. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden"
          >
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
            <p
              role="alert"
              className="font-sans text-sm text-meridiana-red text-center"
            >
              Non siamo riusciti a inviare la richiesta. Riprova tra poco: i
              dati inseriti sono ancora qui.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "w-full min-h-14 rounded-xl font-sans font-semibold text-base",
              "transition-all duration-200 ease-out motion-reduce:transition-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridiana-yellow-hover",
              canSubmit
                ? "bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black shadow-sm hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100 cursor-pointer"
                : "bg-meridiana-yellow/40 text-meridiana-black/40 cursor-not-allowed",
            ].join(" ")}
          >
            {status === "sending" ? "Invio in corso…" : "Invia la richiesta"}
          </button>
          <p className="font-sans text-xs text-meridiana-text-tertiary text-center">
            Usiamo questi dati solo per ricontattarti sul report.
          </p>
        </form>
      )}
    </div>
  );
}
