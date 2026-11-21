import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meridiana — Informativa sulla privacy",
  description: "Come Meridiana tratta i dati inviati con la richiesta di analisi per la casa.",
};

const CONTACT_EMAIL = "nicola.sirotti.07@gmail.com";

// Written by Claude, approved by Sirot (22 nov 2026). Not reviewed by a lawyer:
// full regulatory check (data, site) planned after the Livello 2 work.

interface Sezione {
  titolo: string;
  paragrafi: React.ReactNode[];
}

const sezioni: Sezione[] = [
  {
    titolo: "Chi tratta i tuoi dati",
    paragrafi: [
      <>
        Il titolare del trattamento è Nicola Sirotti, persona fisica, che
        sviluppa Meridiana. Per qualsiasi domanda sui tuoi dati puoi scrivere a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        .
      </>,
    ],
  },
  {
    titolo: "Quali dati raccogliamo",
    paragrafi: [
      "Con la richiesta di analisi completa per la casa raccogliamo: nome, email e, se lo indichi, telefono; indirizzo e comune dell'abitazione; i dati sulla casa e sui consumi che inserisci (consumo annuo, superficie, persone, riscaldamento, gas, orientamento del tetto, ombre); se li indichi, l'IRPEF annua, i numeri dei preventivi ricevuti e le note.",
      "Non chiediamo documenti e non conserviamo copie di bollette o preventivi.",
    ],
  },
  {
    titolo: "Perché li usiamo",
    paragrafi: [
      "Solo per preparare l'analisi che hai chiesto e per risponderti. La base giuridica è la tua richiesta (art. 6, par. 1, lett. b del Regolamento UE 2016/679): senza questi dati l'analisi non si può fare. Non li usiamo per pubblicità e non li vendiamo né li cediamo a nessuno.",
      "I calcoli sono fatti da un programma, ma ogni analisi viene controllata da una persona prima di essere inviata: non prendiamo decisioni automatiche che ti riguardano.",
    ],
  },
  {
    titolo: "A chi arrivano",
    paragrafi: [
      "Per funzionare, Meridiana usa alcuni fornitori che trattano i dati per nostro conto:",
      <ul key="fornitori" className="list-disc pl-5 space-y-1">
        <li>Vercel (ospita il sito e riceve il modulo);</li>
        <li>Resend (invia l&apos;email con la tua richiesta al titolare);</li>
        <li>Google (casella di posta del titolare);</li>
        <li>
          Railway (ospita il motore di calcolo: riceve solo i dati tecnici, cioè
          comune, consumi, caratteristiche della casa e preventivi, mai nome,
          email, telefono o indirizzo);
        </li>
        <li>
          PVGIS della Commissione europea (fornisce i dati sul sole: riceve
          solo le coordinate del comune).
        </li>
      </ul>,
      "Vercel, Resend, Google e Railway hanno sede negli Stati Uniti: il trasferimento avviene con le garanzie previste dal Regolamento (Data Privacy Framework UE-USA o clausole contrattuali standard).",
    ],
  },
  {
    titolo: "Per quanto tempo",
    paragrafi: [
      "Conserviamo la richiesta per 12 mesi dall'invio dell'analisi, per poter rispondere a tue domande successive; poi la cancelliamo. Puoi chiederne la cancellazione prima in qualsiasi momento.",
    ],
  },
  {
    titolo: "I tuoi diritti",
    paragrafi: [
      `Puoi chiedere in ogni momento di vedere i tuoi dati, correggerli, cancellarli, limitarne l'uso, opporti al trattamento o riceverli in un formato leggibile, scrivendo a ${CONTACT_EMAIL}. Rispondiamo entro un mese.`,
      <>
        Se ritieni che i tuoi dati siano trattati in modo non corretto puoi
        presentare reclamo al Garante per la protezione dei dati personali (
        <a href="https://www.garanteprivacy.it" className="underline underline-offset-2">
          garanteprivacy.it
        </a>
        ).
      </>,
    ],
  },
  {
    titolo: "Cookie",
    paragrafi: [
      "Il sito non usa cookie di profilazione né strumenti di statistica. Le risposte della stima vengono tenute nel tuo browser (memoria di sessione) solo per precompilare il modulo di analisi, e spariscono quando chiudi la scheda.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <article className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl md:text-5xl text-meridiana-black font-semibold leading-[1.15]">
          Informativa sulla privacy
        </h1>
        <p className="font-sans text-sm text-meridiana-text-tertiary mt-3">
          Richiesta di analisi per la casa · Ultimo aggiornamento: 22 novembre 2026
        </p>

        <div className="mt-10 space-y-8">
          {sezioni.map((s) => (
            <section key={s.titolo}>
              <h2 className="font-serif text-xl md:text-2xl text-meridiana-black font-semibold">
                {s.titolo}
              </h2>
              <div className="mt-3 space-y-3 font-sans text-base text-meridiana-text-secondary leading-relaxed">
                {s.paragrafi.map((p, i) =>
                  typeof p === "string" ? <p key={i}>{p}</p> : <div key={i}>{p}</div>,
                )}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
