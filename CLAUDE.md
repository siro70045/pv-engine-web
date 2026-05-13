@AGENTS.md

> Questo progetto usa Next.js 16+ — vedi AGENTS.md per le differenze rispetto a versioni precedenti.

## Cosa è

Frontend pubblico di Meridiana, sito web per Comuni, Province, fondazioni, scuole. Linguaggio editoriale magazine italiano.

## Stack

Next.js 16+ App Router, TypeScript strict, Tailwind CSS v4 (CSS-first config via `@theme` in `app/globals.css`), React 19. Deploy Vercel su https://pv-engine-web.vercel.app. Chiama backend Railway https://pv-engine-production.up.railway.app via `NEXT_PUBLIC_API_URL`.

## Struttura

- `app/` — `layout.tsx`, `page.tsx`, `globals.css`, `status/page.tsx`
- `components/` — `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, `IntroSection.tsx`, `HealthStatus.tsx`, `MeridianaLogo.tsx`
- `lib/` — `env.ts`, `api.ts`, `types.ts`
- `public/` — `hero-borgo.jpg`

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
- **TypeScript strict, no `any`**. Tipi delle API in `lib/types.ts` riusabili.
- **No browser storage in artifacts**: localStorage/sessionStorage evitati. Stato in React state.

## Stato attuale (13 mag 2026)

- Setup Next.js + deploy Vercel funzionante
- Hero homepage con foto borgo, 3 banner glass, linee SVG di connessione
- Navbar glass + logo Meridiana custom SVG + Footer
- Sezione "Cosa fa Meridiana" (IntroSection)
- Pagina `/status` interna (diagnostica API)

## Sezioni mancanti / Roadmap sito

- [ ] Sezione "Per chi è" (3 card Scuole/Casa/Aziende) sotto IntroSection
- [ ] Pagina `/scuole`
- [ ] Pagina `/casa`
- [ ] Pagina `/aziende`
- [ ] Pagina `/magazine` (lista articoli)
- [ ] Pagina `/metodologia`
- [ ] Pagina `/storia` (fondatore)
- [ ] Pagina `/manifesto` (decisioni etiche)
- [ ] Pagina `/casi-reali` (Borzano + altri pilota)

## Problemi noti

- Linee SVG connessione banner-edifici puntano correttamente agli edifici solo a risoluzione ~1400px. Su full-screen 2560+ i punti destinazione sono leggermente off (foto in `object-cover`, crop dinamico). Decisione 13 mag 2026: lasciare così, è dettaglio decorativo, non bloccante.
- Voci navbar puntano a `/scuole`, `/casa`, ecc. ma quelle pagine non esistono ancora → 404 al click. Comportamento atteso fino a quando le pagine vengono create.

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
