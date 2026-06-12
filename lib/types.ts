export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
  environment: string;
  modules: {
    engine: boolean;
    school: boolean;
    pvgis_reachable: boolean;
  };
  cache: {
    tmy_entries: number;
    tmy_max: number;
    tmy_hits: number;
    tmy_misses: number;
    disk_entries: number;
    disk_dir: string;
  };
}

// ── POST /estimate (stima preliminare Livello 1) ──────────────────────────────

export interface EstimateRequest {
  comune: string;
  provincia: string; // sempre inviata: l'autocomplete la conosce, elimina gli omonimi
  tipologia: "elementare" | "media" | "liceo" | "tecnico_professionale";
  fascia_studenti: "lt_100" | "100_300" | "300_600" | "gt_600";
  fascia_anno: "pre_1960" | "1960_1980" | "1980_2000" | "post_2000" | "non_lo_so";
  potenza_kwp: number | null;
}

export interface RangeLowHigh {
  low: number;
  high: number;
}

export interface EstimateResponse {
  comune_risolto: {
    nome: string;
    provincia: string;
    regione: string;
    zona_climatica: string;
  };
  kwp_ipotizzato: number;
  auto_dimensionato: boolean;
  taglie_disponibili: { minimal: number; recommended: number; maximum: number };
  produzione_annua_kwh: RangeLowHigh;
  risparmio_annuo_eur: RangeLowHigh;
  ricavi_cessione_eur_anno: RangeLowHigh;
  payback_anni: RangeLowHigh;
  co2_evitata_kg_anno: RangeLowHigh;
  capex_indicativo_eur: number;
  assunzioni: string[];
}

// Voce minima di public/data/comuni.json (n = nome ISTAT, p = sigla provincia)
export interface ComuneEntry {
  n: string;
  p: string;
}
