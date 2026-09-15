import { env } from "./env";
import type { HealthResponse } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>("/health");
}

export async function postEstimate(
  req: import("./types").EstimateRequest,
): Promise<import("./types").EstimateResponse> {
  return fetchApi("/estimate", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function postCasaEstimate(
  req: import("./types").CasaEstimateRequest,
): Promise<import("./types").CasaEstimateResponse> {
  return fetchApi("/estimate/casa", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// Internal Next.js route (same origin), NOT the Railway backend: lead data
// stays within our perimeter and the Resend key stays server-side.
export async function postLead(
  req: import("./types").LeadRequest,
): Promise<import("./types").LeadResponse> {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<import("./types").LeadResponse>;
}
