# Meridiana: website

The public website of Meridiana, a tool that estimates whether a solar system on a specific roof is worth the money: https://meridiana.site. It calls the engine API in [pv-engine](https://github.com/siro70045/pv-engine).

## Pages

- `/`: home page
- `/scuole`: the programme for schools
- `/scuole/stima`: estimate for a school building
- `/casa/stima`: estimate for a household (first version, not yet linked from the home page)
- `/status`: API diagnostics

The site text is in Italian, because the users are Italian schools and families. Not yet updated to reflect the current status of the project.

## Run it

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to the engine API
npm run dev                        # http://localhost:3000
```

Stack: Next.js (App Router), TypeScript, Tailwind CSS v4. Deployed on Vercel.

## How this was built

The design decisions and the content are mine. Most of the code was written by Claude Code, an AI coding assistant, from my specifications; `CLAUDE.md` is the project memory the assistant reads.
