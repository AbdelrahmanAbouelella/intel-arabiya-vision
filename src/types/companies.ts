export type CompanyRow = {
  id: string;
  name_en: string;
  name_ar?: string;
  sector: string;
  country: string;
  exchange?: string;
  ticker?: string;
  isin?: string;
  currency?: string;
  revenue_last?: number;
  net_income_last?: number;
  risk_score?: number; // 0..100
  last_event_summary?: { lang: 'en'|'ar'; text: string };
  sentiment?: 'neg'|'neu'|'pos';
};

export type CompaniesQuery = {
  query?: string;
  sector?: string;
  country?: string;
  exchange?: string;
  mcap_min?: number;
  mcap_max?: number;
  risk_min?: number;
  risk_max?: number;
};

export type CompaniesPage = {
  items: CompanyRow[];
  cursor_next?: string;
};

