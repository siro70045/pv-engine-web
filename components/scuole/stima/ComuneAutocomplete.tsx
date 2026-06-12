"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComuneEntry } from "@/lib/types";

// Local autocomplete over public/data/comuni.json (lazy-fetched by the page,
// passed in as `comuni`). Selecting a row stores name AND province — the
// province is always sent to the API, killing homonyms upstream.
// Matching mirrors the backend's normalize_comune_name: lowercase, accents
// stripped, apostrophes/hyphens as spaces.

export interface ComuneSelection {
  nome: string;
  provincia: string;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MAX_SUGGESTIONS = 8;

export default function ComuneAutocomplete({
  comuni,
  loadError,
  selection,
  onSelect,
}: {
  comuni: ComuneEntry[] | null; // null = still loading
  loadError: boolean;
  selection: ComuneSelection | null;
  onSelect: (s: ComuneSelection | null) => void;
}) {
  // Initialise from an existing selection: the component unmounts while the
  // result view is shown, and "Modifica i dati" must restore the visible text
  const [query, setQuery] = useState(
    selection ? `${selection.nome} (${selection.provincia})` : "",
  );
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!comuni || selection) return [];
    const q = normalize(query);
    if (q.length < 2) return [];
    // Collect ALL matches before ranking: the CSV is in ISTAT-code order
    // (north first), so an early break would hide e.g. "Albinea" behind
    // eight Piedmont/Lombardy "Albi…" comuni. Exact match first, then
    // prefix matches alphabetically, then substring matches.
    const starts: ComuneEntry[] = [];
    const contains: ComuneEntry[] = [];
    for (const c of comuni) {
      const n = normalize(c.n);
      if (n.startsWith(q)) starts.push(c);
      else if (n.includes(q)) contains.push(c);
    }
    const byName = (a: ComuneEntry, b: ComuneEntry) =>
      (normalize(b.n) === q ? 1 : 0) - (normalize(a.n) === q ? 1 : 0) ||
      a.n.localeCompare(b.n, "it");
    starts.sort(byName);
    contains.sort(byName);
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [comuni, query, selection]);

  useEffect(() => setHighlighted(0), [query]);

  function pick(c: ComuneEntry) {
    onSelect({ nome: c.n, provincia: c.p });
    setQuery(`${c.n} (${c.p})`);
    setOpen(false);
  }

  function handleChange(v: string) {
    setQuery(v);
    setOpen(true);
    if (selection) onSelect(null); // typing again invalidates the selection
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={loadError ? "Elenco comuni non disponibile" : "Es. Albinea"}
        value={query}
        disabled={loadError}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        className={[
          "w-full min-h-12 px-4 py-3 rounded-xl font-sans text-base",
          "bg-meridiana-cream-light border placeholder:text-meridiana-text-tertiary",
          "transition-colors duration-200 motion-reduce:transition-none",
          "focus:outline-none focus:border-meridiana-yellow focus:ring-2 focus:ring-meridiana-yellow/40",
          selection
            ? "border-meridiana-green text-meridiana-black font-medium"
            : "border-meridiana-border-light text-meridiana-black",
        ].join(" ")}
      />
      {selection && (
        <span
          aria-hidden
          className="absolute right-4 top-1/2 -translate-y-1/2 text-meridiana-green font-semibold"
        >
          ✓
        </span>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgba(26,22,18,0.12)] border border-meridiana-border-light overflow-hidden"
        >
          {suggestions.map((c, i) => (
            <li
              key={`${c.n}-${c.p}`}
              role="option"
              aria-selected={i === highlighted}
              // onMouseDown beats the input's onBlur, keeping taps reliable
              onMouseDown={(e) => {
                e.preventDefault();
                pick(c);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={[
                "min-h-11 px-4 py-3 font-sans text-base cursor-pointer flex items-baseline gap-2",
                i === highlighted
                  ? "bg-meridiana-yellow/25"
                  : "bg-white",
              ].join(" ")}
            >
              <span className="text-meridiana-black">{c.n}</span>
              <span className="text-sm text-meridiana-text-tertiary">
                ({c.p})
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && !loadError && comuni && query.trim().length >= 2 &&
        suggestions.length === 0 && !selection && (
        <p className="font-sans text-sm text-meridiana-text-tertiary mt-2">
          Nessun comune trovato con questo nome.
        </p>
      )}
    </div>
  );
}
