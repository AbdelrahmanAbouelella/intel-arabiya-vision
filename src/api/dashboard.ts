import { get } from "./http";
import type { KPI, EventItem } from "@/types/dashboard";

export async function getKpis(): Promise<KPI[]> {
  return get<KPI[]>("/dashboard/kpis");
}

export async function getMarketRiskIndex(): Promise<number> {
  const res = await get<{ value: number }>("/dashboard/market-risk");
  return res?.value ?? 0;
}

export async function listLatestEvents(params: { limit?: number; cursor?: string } = {}): Promise<{ items: EventItem[]; cursor_next?: string }> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k,v])=>{ if(v!==undefined && v!==null && v!=='') q.set(k, String(v)); });
  return get<{ items: EventItem[]; cursor_next?: string }>(`/events/latest?${q.toString()}`);
}
