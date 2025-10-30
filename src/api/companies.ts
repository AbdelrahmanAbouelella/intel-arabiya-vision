import { get } from "./http";
import type { CompaniesPage, CompanyProfile, FinancialSeries, EventItem, CompaniesQuery } from "@/types/api";

type ListCompaniesParams = CompaniesQuery & {
  limit?: number;
  cursor?: string;
};

export async function listCompanies(params: ListCompaniesParams = {}): Promise<CompaniesPage> {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([k,v])=>{ if(v!==undefined && v!==null && v!=='') query.set(k, String(v)); });
  return get<CompaniesPage>(`/companies?${query.toString()}`);
}

export async function getCompany(id: string, opts?: { lang?: string }): Promise<CompanyProfile> {
  if (!id) throw { status: 400, message: "Missing company id" };
  return get<CompanyProfile>(`/companies/${encodeURIComponent(id)}`, opts?.lang as any);
}

export async function getCompanyFinancials(
  id: string,
  freq: "quarterly" | "annual",
  periods: number
): Promise<FinancialSeries> {
  if (!id) throw { status: 400, message: "Missing company id" };
  const q = new URLSearchParams({ freq, periods: String(periods) });
  return get<FinancialSeries>(`/companies/${encodeURIComponent(id)}/financials?${q.toString()}`);
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
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v])=>{ if(v!==undefined && v!==null && v!=='') query.set(k, String(v)); });
  return get<{ items: EventItem[]; cursor_next?: string }>(`/companies/${encodeURIComponent(id)}/events?${query.toString()}`);
}

export async function getCompanyForecast(
  id: string,
  metric: 'revenue' | 'net_income'
): Promise<{ items: Array<{ horizon: string | number; value: number; ci_low?: number; ci_high?: number; model_version?: string; mape?: number; mae?: number }> }> {
  if (!id) throw { status: 400, message: 'Missing company id' };
  const q = new URLSearchParams({ company_id: id, metric });
  return get<{ items: Array<{ horizon: string | number; value: number; ci_low?: number; ci_high?: number; model_version?: string; mape?: number; mae?: number }> }>(`/forecasts?${q.toString()}`);
}
