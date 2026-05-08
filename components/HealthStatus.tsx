"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export default function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return <p className="text-meridiana-red">Errore: {error}</p>;
  }
  if (!health) {
    return (
      <p className="text-meridiana-text-tertiary">Verifico stato…</p>
    );
  }

  return (
    <div className="border border-meridiana-border-light bg-meridiana-cream-light rounded-lg p-6">
      <h3 className="text-xl mb-3">Stato del sistema</h3>
      <ul className="space-y-1 text-sm">
        <li>
          Versione: <strong>{health.version}</strong>
        </li>
        <li>
          Uptime: <strong>{health.uptime_seconds}s</strong>
        </li>
        <li>Engine: {health.modules.engine ? "✓" : "✗"}</li>
        <li>School: {health.modules.school ? "✓" : "✗"}</li>
        <li>
          PVGIS reachable: {health.modules.pvgis_reachable ? "✓" : "✗"}
        </li>
      </ul>
    </div>
  );
}
