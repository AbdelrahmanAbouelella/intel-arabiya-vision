import { supabase } from "@/integrations/supabase/client";
import type { KPI, EventItem } from "@/types/dashboard";

export async function getKpis(): Promise<KPI[]> {
  const { data, error } = await supabase.functions.invoke('dashboard-kpis');
  if (error) throw error;
  return data || [];
}

export async function getMarketRiskIndex(): Promise<number> {
  const { data, error } = await supabase.functions.invoke('dashboard-market-risk');
  if (error) throw error;
  return data ?? 58;
}

export async function listLatestEvents(params: { limit?: number; cursor?: string } = {}): Promise<{ items: EventItem[]; cursor_next?: string }> {
  const { data, error } = await supabase.functions.invoke('events-latest', {
    body: params,
  });
  if (error) throw error;
  return data || { items: [], cursor_next: undefined };
}
