@AGENTS.md

> Questo progetto usa Next.js 16+ — vedi AGENTS.md per le differenze rispetto a versioni precedenti.

## Cosa è

Frontend pubblico di Meridiana, sito web per Comuni, Province, fondazioni, scuole. Linguaggio editoriale magazine italiano.

## Stack

Next.js 16+ App Router, TypeScript strict, Tailwind CSS v4 (CSS-first config via `@theme` in `app/globals.css`), React 19. Deploy Vercel su https://pv-engine-web.vercel.app. Chiama backend Railway https://pv-engine-production.up.railway.app via `NEXT_PUBLIC_API_URL`.

## Struttura

- `app/` — `layout.tsx`, `page.tsx`, `globals.css`, `status/page.tsx`, `scuole/stima/page.tsx`, `api/lead/route.ts` (route handler interno)
- `components/` — `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, `IntroSection.tsx`, `HealthStatus.tsx`, `MeridianaLogo.tsx`; `scuole/` (sezioni /scuole), `scuole/stima/` (simulatore: StimaFlow, ComuneAutocomplete, Pills, ResultView, LeadForm…)
- `lib/` — `env.ts`, `api.ts`, `types.ts`
- `public/` — `hero-borgo.jpg`, `data/comuni.json` (dataset ISTAT per autocomplete, lazy-fetched)

## Design tokens Meridiana

Definiti in `app/globals.css` via `@theme`:

- **Background**: cream `#EFE7DA` / cream-light `#F5EFE6` / cream-elevated `#FBF7F0`
- **Text**: black `#1A1612` / text-secondary `#4A453E` / text-tertiary `#8B857A`
- **Accents**: yellow `#E8B547` / yellow-hover `#D49E2E` / green `#5B7553` / red `#B5523A`
- **Borders**: border-light `#E5DCC9` / border-medium `#C9BCA0`
- **Font**: Newsreader serif (titoli) + Inter sans (body)

## Decisioni architetturali

- **Full-stack-ready ma frontend-only oggi**: tutto il fetching passa per `lib/api.ts`. Quando in futuro serviranno API routes interne, database, auth, si aggiungono senza riscrivere componenti.
- **Sito editoriale magazine (questo), simulatore mobile-app (futuro)** — decisione 9 mag 2026. Sito mantiene tono caldo-narrativo + tecnico-rigoroso per credibilità istituzionale. Simulatore futuro userà card morbide, border-radius generosi, sans-only.
- **Design system simulatore (primo esemplare: /scuole/stima)** — app-like dentro il sito editoriale: card bianche/cream `rounded-2xl` con ombra diffusa, pillole al posto dei dropdown (`Pills`, tap target ≥44px), sans-only, giallo = selezione/CTA. Stesso linguaggio per ogni futuro flusso interattivo.
- **Pagina risultato: 3 metriche + tease** — decisione 12 giu 2026. Mostra SOLO produzione annua (hero), investimento indicativo, tempo di rientro. Risparmio, cessione, beneficio, CO₂ e taglie sono riservati di proposito al report completo (tease card). Arrotondamenti SOLO in presentazione (migliaia, mezzo anno, prefisso "circa"); l'API resta precisa.
- **Flusso lead via Resend + route handler interno** (`app/api/lead/route.ts`) — i dati dei lead restano nel nostro perimetro; `RESEND_API_KEY` e `LEAD_NOTIFICATION_EMAIL` solo server-side (mai `NEXT_PUBLIC`, vedi `.env.local.example`; da configurare anche su Vercel). Anti-spam silenzioso: honeypot off-screen + time-trap 3s, entrambi rispondono con finto successo. `from` sandbox `onboarding@resend.dev` (consegna solo all'owner dell'account finché non si verifica un dominio), `reply_to` = email del richiedente.
- **Tailwind v4: `scale-*` emette la proprietà nativa `scale`** (non `transform`): nelle `transition-[...]` mirate va elencato `scale`, altrimenti niente animazione (`transition-all` lo maschera). Le varianti `hover:` sono già gated su `@media (hover: hover)`: il touch è escluso gratis.
- **TypeScript strict, no `any`**. Tipi delle API in `lib/types.ts` riusabili.
- **No browser storage in artifacts**: localStorage/sessionStorage evitati. Stato in React state.
- **Illustrazioni "Per chi è"**: PNG con alpha trasparente, dimensione nativa 1382×752 (aspect-ratio `1382/752`), in `public/images/per-chi/`. Mai croppate (`object-contain`).
- **Numerale gigante rimosso**: il design originale della sezione "Per chi è" prevedeva grandi numerali decorativi (1, 2, 3) dietro le illustrazioni; rimossi in iterazione — decisione di Sirot — per rendere l'illustrazione l'elemento visivo primario.
- **Schema backend `/estimate/casa`** (verificato 13 set 2026): `n_occupants` e `floor_area_m2` sono SEMPRE richiesti dall'API (anche in bolletta mode, servono per la stima del tetto). Campo consumo = `bolletta_kwh` (non `consumo_kwh`). Auto elettrica = `ev`. IRPEF = `irpef_annua_stimata`. Orientamento: `sud_est_sud_ovest`, `est_o_ovest`, `non_so`. La response usa `verdetto_pv.etichetta`+`testo` (non `verdetto`/`testo` al top level). `produzione_annua_kwh` è un numero scalare (non range). Scenari: `senza_batteria.capex_eur`, `senza_batteria.payback_anni` scalare (non range). `taglie_confronto[].label` (non `etichetta`), `capex_eur`, `autosufficienza_pct`.
- **Animazioni scroll**: parallax via CSS scroll-driven native (`animation-timeline: view()`) in CSS Module, gated da `@supports` (fallback statico su browser senza supporto, es. Safari ≤18) + `prefers-reduced-motion` + breakpoint desktop. Stack coerente tra PerChiCard e IntroSection.

## Stato attuale (12 giu 2026)

- Setup Next.js + deploy Vercel funzionante
- Hero homepage con foto borgo, 3 banner glass, linee SVG di connessione — con scroll parallax sulla foto (±38px su scroll(root), reduced-motion safe)
- Navbar glass + logo Meridiana custom SVG + Footer
- Sezione "Cosa fa Meridiana" (IntroSection) — con parallax leggero su blocco testo (~±20px, solo desktop, reduced-motion safe)
- Sezione "Per chi è" (3 blocchi zig-zag Casa/Scuole/Aziende con illustrazioni isometriche, hover scale/saturate/shadow + scroll parallax) — COMPLETATA
- Navbar: hover scale 1.12 sulle voci; logo+wordmark Meridiana con hover scale 1.10 + oscillazione dei 5 raggi (reduced-motion safe)
- **Pagina `/scuole`** (segmento operativo primario) — 5 sezioni: Hero con foto scuola, Intro + 3 bottoni navigatori, "Come funziona" (4 passi), "Il programma educativo" (in arrivo autunno 2026), "Calibrato per le scuole" (calendario/occupazione/consumo). Fade-in di entrata one-shot per sezione (stagger eyebrow/titolo/corpo, reduced-motion safe) + smooth scroll tra bottoni e ancore. Componenti in `components/scuole/`. COMPLETATA
- Pagina `/casa` — placeholder "IN ARRIVO", ma `/casa/stima` è COMPLETATA (vedi sotto)
- Pagina `/aziende` — placeholder "IN ARRIVO" (componente `InArrivoPlaceholder`), in attesa di sviluppo
- **Pagina `/scuole/stima`** (Fase C) — stima preliminare Livello 1: form app-like (autocomplete comuni ISTAT, pillole), risultato con 3 metriche arrotondate + tease report + accordion assunzioni, form lead Livello 2 inline (Resend via `/api/lead`, honeypot + time-trap). CTA in fondo a `/scuole`. COMPLETATA
- **Pagina `/casa/stima`** (Fase 2) — stima residenziale Livello 1: form a divulgazione progressiva (6 step, ogni campo appare come conseguenza del precedente con animazione + smooth scroll), due percorsi consumo (bolletta diretta / proxy), risultato con verdetto Meridiana + 3 metriche + "cosa cambierebbe le cose" + confronto scenari batteria + tabella taglie + assunzioni accordion. Backend: POST `/estimate/casa` stesso host scuole. NESSUN form lead Livello 2 (solo nota testuale). Componenti in `components/casa/stima/`. COMPLETATA (13 set 2026)
- Pagina `/status` interna (diagnostica API)

## Sezioni mancanti / Roadmap sito

- [x] ~~Sezione "Per chi è" (3 card Scuole/Casa/Aziende) sotto IntroSection~~ — COMPLETATA (zig-zag, illustrazioni isometriche, parallax + hover)
- [x] ~~Pagina `/scuole`~~ — COMPLETATA (5 sezioni editoriali, fade-in entry, smooth scroll)
- [x] ~~Pagina `/scuole/stima` + form lead~~ — COMPLETATA (Fase C: stima Livello 1 + richiesta report via Resend)
- [x] ~~Pagina `/casa/stima`~~ — COMPLETATA (Fase 2: form progressivo + risultato residenziale)
- [ ] Pagina `/casa` — contenuto editoriale da sviluppare (placeholder attivo; `/casa/stima` già live)
- [ ] Pagina `/aziende` — placeholder "IN ARRIVO" attivo, contenuto da sviluppare
- [ ] Pagina `/magazine` (lista articoli)
- [ ] Pagina `/metodologia`
- [ ] Pagina `/storia` (fondatore)
- [ ] Pagina `/manifesto` (decisioni etiche)
- [ ] Pagina `/casi-reali` (Borzano + altri pilota)

## Problemi noti

- Linee SVG connessione banner-edifici puntano correttamente agli edifici solo a risoluzione ~1400px. Su full-screen 2560+ i punti destinazione sono leggermente off (foto in `object-cover`, crop dinamico). Decisione 13 mag 2026: lasciare così, è dettaglio decorativo, non bloccante.
- Voci navbar e card "Per chi è" puntano a `/scuole`, `/casa`, `/aziende`: ora tutte e tre esistono (più nessun 404). `/scuole` è completa; `/casa` e `/aziende` mostrano un placeholder "IN ARRIVO" finché non vengono sviluppate.
- ⚠ Numeri hero banner (120.000 kWh) allineati al valore 
  conservativo dichiarato, non al motore standalone (131.763). 
  Da riconciliare quando si risolve la discrepanza tracciata 
  nel CLAUDE.md di pv_engine.

## Convenzioni codice

- TypeScript strict, no `any`
- Una responsabilità per componente in `components/`
- Logica API solo in `lib/api.ts` (mai `fetch` diretto nei componenti)
- Tailwind utility-first, niente CSS inline
- Codice + commenti in **inglese**; UI utente in **italiano**

## Workflow standard

- Dev locale: `npm run dev` (porta 3000)
- Build di verifica: `npm run build`
- Type check: `npx tsc --noEmit`
- Deploy: `git push origin main` → Vercel redeploy auto (~60s)

## Storia commit principali

- `48d7b09` feat(web): Next.js base setup with Meridiana brand
- `fc3c09b` feat(web): add navbar and footer
- `0151c37` feat(web): hero homepage with full-bleed photo and glass overlays
- `6659d54` feat(web): replace placeholder ☀ emoji with custom Meridiana SVG logo
- `cd2536c` feat(web): add Cosa fa Meridiana intro section
- `4a3f963` feat(web): add connection lines from banners to buildings in hero
- + commit successivi di rifinitura (fade, logo, linee SVG)

## Come usare questo file

Leggi CLAUDE.md all'inizio di ogni sessione di lavoro su questo repo. Aggiornalo quando:

- Aggiungi una sezione/pagina nuova (segnala in roadmap come completata)
- Cambi decisioni di design system
- Risolvi un problema noto
- Identifichi un nuovo debito tecnico
