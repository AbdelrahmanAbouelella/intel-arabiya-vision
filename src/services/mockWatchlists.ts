import type { Watchlist, WatchlistRollups } from '@/types/watchlists';
import type { CompanyRow } from '@/types/companies';
import { getCompanies } from './mockCompanies';
import { USE_MOCKS } from "@/lib/runtime";

let lists: Watchlist[] = [
  { id: 'wl-1', name: 'My Watchlist', companyIds: [] }
];

const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export async function listWatchlists(): Promise<Watchlist[]> {
  if (!USE_MOCKS) {
    const { listWatchlists } = await import("@/api/watchlists");
    return listWatchlists();
  }
  await wait(150);
  return JSON.parse(JSON.stringify(lists));
}

export async function createWatchlist(name: string): Promise<{id:string}> {
  await wait(150);
  const id = 'wl-' + (lists.length + 1);
  lists.push({ id, name, companyIds: [] });
  return { id };
}

export async function addCompaniesToWatchlist(watchlistId: string, companyIds: string[]): Promise<void> {
  if (!USE_MOCKS) {
    const { addCompaniesToWatchlist } = await import("@/api/watchlists");
    return addCompaniesToWatchlist(watchlistId, companyIds);
  }
  await wait(150);
  const wl = lists.find(x => x.id === watchlistId);
  if (!wl) return;
  const set = new Set(wl.companyIds);
  companyIds.forEach(id => set.add(id));
  wl.companyIds = Array.from(set);
}

export async function removeCompanyFromWatchlist(watchlistId: string, companyId: string): Promise<void> {
  await wait(150);
  const wl = lists.find(x => x.id === watchlistId);
  if (!wl) return;
  wl.companyIds = wl.companyIds.filter(id => id !== companyId);
}

// Rollups تستخدم بيانات الـmockCompanies عبر getCompanies (نجيب مجموعة كبيرة ونرشّح)
export async function getWatchlistRollups(watchlistId: string): Promise<WatchlistRollups> {
  const wl = lists.find(x => x.id === watchlistId);
  if (!wl) return { count:0, topRisk:[], lowRisk:[], topRevenue:[] };

  // هات بيانات كثيرة ونرشّح ids
  const page1 = await getCompanies({}, undefined);
  const page2 = await getCompanies({}, page1.cursor_next);
  const all: CompanyRow[] = [...page1.items, ...page2.items];

  const rows = all.filter(r => wl.companyIds.includes(r.id));
  const byRiskDesc = [...rows].sort((a,b)=> (b.risk_score??0) - (a.risk_score??0));
  const byRiskAsc  = [...rows].sort((a,b)=> (a.risk_score??0) - (b.risk_score??0));
  const byRevenue  = [...rows].sort((a,b)=> (b.revenue_last??0) - (a.revenue_last??0));

  return {
    count: rows.length,
    topRisk: byRiskDesc.slice(0,5).map(r => ({ id:r.id, name:r.name_en, risk:r.risk_score??0 })),
    lowRisk: byRiskAsc.slice(0,5).map(r => ({ id:r.id, name:r.name_en, risk:r.risk_score??0 })),
    topRevenue: byRevenue.slice(0,5).map(r => ({ id:r.id, name:r.name_en, revenue:r.revenue_last??0 })),
  };
}
