import { supabase } from "@/integrations/supabase/client";
import type { CompaniesPage, CompanyProfile, FinancialSeries, EventItem, CompaniesQuery } from "@/types/api";

type ListCompaniesParams = CompaniesQuery & {
  limit?: number;
  cursor?: string;
};

export async function listCompanies(params: ListCompaniesParams = {}): Promise<CompaniesPage> {
  const limit = params.limit || 25;
  const offset = params.cursor ? parseInt(params.cursor) : 0;
  
  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (params.query) {
    query = query.or(`name_en.ilike.%${params.query}%,name_ar.ilike.%${params.query}%,ticker.ilike.%${params.query}%`);
  }
  if (params.sector) {
    query = query.eq('sector', params.sector as any);
  }
  if (params.country) {
    query = query.eq('country', params.country as any);
  }
  if (params.exchange) {
    query = query.eq('exchange', params.exchange);
  }
  if (params.mcap_min) {
    query = query.gte('market_cap_usd', params.mcap_min);
  }
  if (params.mcap_max) {
    query = query.lte('market_cap_usd', params.mcap_max);
  }
  if (params.risk_min) {
    query = query.gte('risk_score', params.risk_min);
  }
  if (params.risk_max) {
    query = query.lte('risk_score', params.risk_max);
  }

  const { data, error, count } = await query;
  
  if (error) throw error;

  const hasMore = offset + (data?.length || 0) < (count || 0);
  return {
    items: (data || []) as any,
    cursor_next: hasMore ? String(offset + limit) : undefined,
  };
}

export async function getCompany(id: string, opts?: { lang?: string }): Promise<CompanyProfile> {
  if (!id) throw { status: 400, message: "Missing company id" };
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!data) throw { status: 404, message: "Company not found" };
  
  return data as any;
}

export async function getCompanyFinancials(
  id: string,
  freq: "quarterly" | "annual",
  periods: number
): Promise<FinancialSeries> {
  if (!id) throw { status: 400, message: "Missing company id" };
  
  const periodType = freq === "quarterly" ? ["Q1", "Q2", "Q3", "Q4"] : ["FY"];
  
  const { data, error } = await supabase
    .from('financials')
    .select('*')
    .eq('company_id', id)
    .in('period_type', periodType as any)
    .order('period', { ascending: false })
    .limit(periods);
  
  if (error) throw error;
  
  return (data || []).map(f => ({
    period: f.period,
    revenue: f.revenue_usd || 0,
    ebitda: f.ebitda_usd,
    net_income: f.net_income_usd,
    margin: f.operating_margin,
  }));
}

export type CompanyEventsParams = {
  limit?: number;
  cursor?: string;
  types?: string[];
  severity?: string;
  sentiment?: string;
};

export async function getCompanyEvents(
  id: string,
  params: CompanyEventsParams = {}
): Promise<{ items: EventItem[]; cursor_next?: string }> {
  if (!id) throw { status: 400, message: "Missing company id" };
  
  const limit = params.limit || 20;
  const offset = params.cursor ? parseInt(params.cursor) : 0;
  
  let query = supabase
    .from('events')
    .select(`
      id,
      event_type,
      event_date,
      title_en,
      summary_en,
      severity,
      sentiment,
      source_type
    `, { count: 'exact' })
    .eq('company_id', id)
    .order('event_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.types && params.types.length > 0) {
    query = query.in('event_type', params.types as any);
  }
  if (params.severity) {
    query = query.eq('severity', params.severity as any);
  }
  if (params.sentiment) {
    query = query.eq('sentiment', params.sentiment as any);
  }

  const { data, error, count } = await query;
  
  if (error) throw error;

  const hasMore = offset + (data?.length || 0) < (count || 0);
  
  // Capitalize first letter for severity and sentiment to match EventItem type
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  
  return {
    items: (data || []).map(e => ({
      id: e.id,
      company: '',
      time: e.event_date,
      type: e.event_type,
      severity: capitalize(e.severity) as any,
      sentiment: capitalize(e.sentiment) as any,
      summary: e.summary_en || e.title_en,
      source: e.source_type || 'N/A',
    })),
    cursor_next: hasMore ? String(offset + limit) : undefined,
  };
}

export async function getCompanyForecast(
  id: string,
  metric: 'revenue' | 'net_income'
): Promise<{ items: Array<{ horizon: string | number; value: number; ci_low?: number; ci_high?: number; model_version?: string; mape?: number; mae?: number }> }> {
  if (!id) throw { status: 400, message: 'Missing company id' };
  
  const { data, error } = await supabase
    .from('forecasts')
    .select('*')
    .eq('company_id', id)
    .eq('metric', metric)
    .order('forecast_date', { ascending: true });
  
  if (error) throw error;
  
  return {
    items: (data || []).map(f => ({
      horizon: f.forecast_date,
      value: f.forecast_value || 0,
      ci_low: f.confidence_interval_low,
      ci_high: f.confidence_interval_high,
      model_version: f.model_version,
      mape: f.mape,
      mae: f.mae,
    })),
  };
}
