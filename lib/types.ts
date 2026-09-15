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

// ── POST /api/lead (richiesta report completo, Livello 2) ─────────────────────

export const LEAD_RUOLI = [
  "dirigente_scolastico",
  "ente_locale",
  "docente_genitore",
  "altro",
] as const;
export type LeadRuolo = (typeof LEAD_RUOLI)[number];

// Estimate context echoed back by the client so the notification email can
// summarize what the visitor saw. Output figures are the DISPLAYED (rounded)
// strings, not the precise API values — the email mirrors the page.
export interface LeadStimaContext {
  comune: string;
  provincia: string;
  tipologia: string;
  fascia_studenti: string;
  fascia_anno: string;
  kwp: number;
  produzione: string;
  investimento: string;
  payback: string;
}

export interface LeadRequest {
  nome: string;
  ruolo: LeadRuolo;
  comune: string;
  scuola?: string;
  email: string;
  telefono?: string;
  note?: string;
  website?: string; // honeypot — humans never see it, bots fill it
  opened_at: number; // epoch ms when the form was expanded (time-trap)
  stima: LeadStimaContext;
}

export interface LeadResponse {
  ok: boolean;
}

// ── POST /estimate/casa (stima preliminare residenziale Livello 1) ─────────────

export type CasaOrientamento =
  | "sud"
  | "sud_est_sud_ovest"
  | "est_o_ovest"
  | "nord"
  | "non_so";

export type CasaPresenzaDiurna = "per_lo_piu_vuota" | "spesso_occupata";

export type CasaVerdetto =
  | "ottimo"
  | "buono"
  | "accettabile"
  | "marginale"
  | "negativo";

export interface CasaEstimateRequest {
  comune: string;
  provincia?: string;
  // Always required (used for roof area + consumption estimation)
  n_occupants: number;
  floor_area_m2: number;
  // Consumption: direct kWh (optional, wins over proxy when provided)
  bolletta_kwh?: number;
  // Proxy consumption factors (optional, defaulted to false)
  riscaldamento_elettrico?: boolean;
  acqua_calda_elettrica?: boolean;
  ev?: boolean;
  condizionatore?: boolean;
  // Defaults provided by backend when omitted
  presenza_diurna?: CasaPresenzaDiurna;
  orientamento?: CasaOrientamento;
  abitazione_principale?: boolean;
  potenza_kwp?: number;
  irpef_annua_stimata?: number;
  // Heat-pump electrification scenario (optional)
  terminali?: string; // termosifoni | pavimento_radiante | ventilconvettori | non_so
  gas_smc_annui?: number;
  gas_smc_estivi_mese?: number;
}

export interface CasaScenario {
  label: string;
  capex_eur: number;
  battery_kwh: number;
  autoconsumo_pct: number;
  autosufficienza_pct: number;
  payback_anni: number;
  npv_eur: number;
  // Deduction breakdown (may be absent on older backend versions)
  detrazione_totale_eur?: number;
  detrazione_effettiva_eur?: number;
}

export interface CasaTaglia {
  label: string;
  kwp: number;
  capex_eur: number;
  produzione_annua_kwh: number;
  autosufficienza_pct: number;
  payback_anni: number;
  npv_eur: number;
}

export interface CasaVerdettoPV {
  payback_anni: number;
  npv_eur: number;
  etichetta: CasaVerdetto;
  autosufficienza_pct: number;
  testo: string;
}

export interface CasaScenarioAlternativo {
  tipo: "elettrificazione";
  titolo: string;
  descrizione: string;
  metriche: {
    consumo_elettrico_stimato_kwh: number;
    kwp_consigliato: number;
  };
  delta_vs_base: {
    npv_eur: number;
    payback_anni: number;
    autosufficienza_pp: number; // percentage points
  };
}

export interface CasaEstimateResponse {
  comune_risolto: {
    nome: string;
    provincia: string;
    regione: string;
    zona_climatica: string;
  };
  consumo_kwh_annuo: number;
  consumo_da_bolletta: boolean;
  kwp_ipotizzato: number;
  auto_dimensionato: boolean;
  produzione_annua_kwh: number;
  co2_evitata_kg_anno?: number;
  payback_anni: RangeLowHigh;
  capex_indicativo_eur: number;
  senza_batteria: CasaScenario;
  con_batteria: CasaScenario;
  verdetto_pv: CasaVerdettoPV;
  taglie_confronto: CasaTaglia[];
  assunzioni: string[];
  scenari_alternativi?: CasaScenarioAlternativo[];
}
