import type { CompanyRow, CompaniesQuery } from "@/types/companies";
import type { EventItem } from "@/types/dashboard";
import type { AlertRule, AlertHistoryItem, AlertTestResult } from "@/types/alerts";
import type { Watchlist } from "@/types/watchlists";

export type { CompanyRow, CompaniesQuery, EventItem, AlertRule, AlertHistoryItem, AlertTestResult, Watchlist };

export type CompaniesPage = {
  items: CompanyRow[];
  cursor_next?: string;
};

export type CompanyProfile = {
  profile: CompanyRow & {
    description?: string;
    stats?: { margin?: number; debt_to_equity?: number };
  };
  financials: FinancialPoint[];
  events: Array<Pick<EventItem, "id" | "time" | "type" | "severity" | "summary">>;
  filings: { id: string; date: string; doc_type: string; url?: string }[];
  people: { name: string; role: string; since: string }[];
  forecast: { horizon: string; value: number; ci_low: number; ci_high: number; model_version: string; mape: number; mae: number }[];
  comparables: { id: string; name: string; growth: number; profitability: number; leverage: number; risk: number }[];
};

export type FinancialPoint = {
  period: string;
  revenue: number;
  ebitda?: number;
  net_income?: number;
  margin?: number;
};

export type FinancialSeries = FinancialPoint[];

