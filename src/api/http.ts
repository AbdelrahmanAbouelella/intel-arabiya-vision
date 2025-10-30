import { API_BASE } from "@/lib/runtime";

export interface HttpError extends Error { status: number; code?: string; }

async function http<T>(path: string, opts: RequestInit & { lang?: "en"|"ar" } = {}): Promise<T> {
  const lang = opts.lang || (document?.documentElement?.lang as "en"|"ar") || "en";
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Accept-Language", lang);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || res.statusText) as HttpError;
    err.status = res.status; err.code = body.code;
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const get  = <T>(p: string, lang?: "en"|"ar") => http<T>(p, { method: "GET", lang });
export const post = <T>(p: string, body?: unknown, lang?: "en"|"ar") =>
  http<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined, lang });
