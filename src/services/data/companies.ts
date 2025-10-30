import { supabase } from '@/lib/supabase';

export type Company = {
  id: string;
  name_en: string;
  name_ar: string | null;
  sector: string | null;
  country: string | null;
  exchange: string | null;
  ticker: string | null;
  isin: string | null;
  currency: string | null;
  revenue_last: number | null;
  net_income_last: number | null;
  risk_score: number | null;
  created_at: string;
};

export async function listCompanies(params?: {
  query?: string;
  sector?: string;
  country?: string;
  limit?: number;
  offset?: number;
}) {
  let q = supabase.from('companies').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  if (params?.query) q = q.ilike('name_en', `%${params.query}%`);
  if (params?.sector) q = q.eq('sector', params.sector);
  if (params?.country) q = q.eq('country', params.country);

  const limit = params?.limit ?? 25;
  const offset = params?.offset ?? 0;
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { items: (data ?? []) as Company[], total: count ?? 0 };
}

export async function getCompany(id: string) {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Company;
}

export async function getFinancials(companyId: string, freq: 'quarterly'|'annual' = 'quarterly', periods = 12) {
  const { data, error } = await supabase
    .from('financials')
    .select('*')
    .eq('company_id', companyId)
    .eq('freq', freq)
    .order('period', { ascending: false })
    .limit(periods);

  if (error) throw error;
  return data ?? [];
}

export async function getEvents(companyId: string, limit = 50) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('company_id', companyId)
    .order('event_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getForecasts(companyId: string, metric: 'revenue'|'net_income' = 'revenue') {
  const { data, error } = await supabase
    .from('forecasts')
    .select('*')
    .eq('company_id', companyId)
    .eq('metric', metric)
    .order('horizon', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
