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
