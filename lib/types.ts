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
