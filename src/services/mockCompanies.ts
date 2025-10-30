import type { CompaniesQuery, CompaniesPage, CompanyRow } from '@/types/companies';
import { USE_MOCKS } from "@/lib/runtime";

const sectors = ['Banks','Energy','Telecom','Materials','Consumer'];
const countries = ['KSA','UAE','Egypt'];
const exchanges = ['Tadawul','DFM','EGX'];

const companies: CompanyRow[] = Array.from({length: 120}).map((_, i) => {
  const sec = sectors[i % sectors.length];
  const c = countries[i % countries.length];
  const ex = exchanges[i % exchanges.length];
  const risk = Math.floor(Math.random()*101);
  const name = ['SABIC','Aramco','Etisalat','ADNOC','QNB','Vodafone Egypt','Banque Misr'][i % 7] + ' ' + (i+1);
  const sent = ['neg','neu','pos'][i%3] as CompanyRow['sentiment'];
  return {
    id: `c-${i+1}`,
    name_en: name,
    name_ar: undefined,
    sector: sec,
    country: c,
    exchange: ex,
    ticker: `TK${i}`,
    isin: `ISIN${1000+i}`,
    currency: ['SAR','AED','EGP'][i%3],
    revenue_last: Math.floor(Math.random()*1_000_000_000),
    net_income_last: Math.floor(Math.random()*300_000_000),
    risk_score: risk,
    last_event_summary: { lang: 'en', text: 'Mock last event summary...' },
    sentiment: sent
  };
});

const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export async function getCompanies(query: CompaniesQuery, cursor?: string): Promise<CompaniesPage> {
  if (!USE_MOCKS) {
    const { listCompanies } = await import("@/api/companies");
    return listCompanies({ ...(query as any), cursor });
  }
  await wait(400);
  // filter in-memory
  let data = companies.filter(c => {
    if (query.query) {
      const q = query.query.toLowerCase();
      if (!c.name_en.toLowerCase().includes(q) && !(c.ticker||'').toLowerCase().includes(q)) return false;
    }
    if (query.sector && c.sector !== query.sector) return false;
    if (query.country && c.country !== query.country) return false;
    if (query.exchange && c.exchange !== query.exchange) return false;
    if (typeof query.risk_min === 'number' && (c.risk_score ?? 0) < query.risk_min) return false;
    if (typeof query.risk_max === 'number' && (c.risk_score ?? 0) > query.risk_max) return false;
    return true;
  });

  const page = cursor ? parseInt(cursor,10) : 0;
  const pageSize = 20;
  const slice = data.slice(page*pageSize, (page+1)*pageSize);
  return {
    items: slice,
    cursor_next: (page+1)*pageSize < data.length ? String(page+1) : undefined
  };
}

export const companiesFacetOptions = {
  sectors, countries, exchanges
};

// Saved Views (Mock)
type SavedView = { id: string; name: string; filters: CompaniesQuery };
let savedViews: SavedView[] = [];

export function listSavedViews() { return Promise.resolve(savedViews); }
export function saveSavedView(name: string, filters: CompaniesQuery) {
  const id = 'v-' + (savedViews.length+1);
  savedViews.push({ id, name, filters });
  return Promise.resolve({ id });
}

// Optional compatibility: expose API-like signature for easy switching
export async function listCompanies(params: CompaniesQuery & { limit?: number; cursor?: string }): Promise<CompaniesPage> {
  return getCompanies(params, params?.cursor);
}
