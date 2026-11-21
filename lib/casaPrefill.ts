import { useSyncExternalStore } from "react";
import type { CasaEstimateRequest } from "./types";

// Hands the answers of /casa/stima over to /casa/analisi. sessionStorage, not
// the URL: query strings end up in logs and history (research §GDPR). Stays in
// this browser tab only and disappears when it closes.

const KEY = "meridiana:casa-stima";

export interface CasaPrefill {
  request: CasaEstimateRequest;
  // The stima sends a fascia midpoint as floor_area_m2: not a real measure,
  // so the analysis form asks for the precise value instead of reusing it.
  superficieDaFascia: boolean;
}

export function savePrefill(p: CasaPrefill): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // storage unavailable (private mode, quota): the form simply starts empty
  }
}


// ── React hook ────────────────────────────────────────────────────────────────
// Raw string snapshot (a primitive, so it is stable between reads). Server and
// first client render see null; the stored answers arrive right after hydration.

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function usePrefillRaw(): string | null {
  return useSyncExternalStore(subscribe, readRaw, () => null);
}

export function parsePrefill(raw: string | null): CasaPrefill | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as CasaPrefill;
    return p && typeof p === "object" && p.request ? p : null;
  } catch {
    return null;
  }
}
