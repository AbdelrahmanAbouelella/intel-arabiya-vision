import type { KPI, EventItem } from '@/types/dashboard';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getDashboardKpis(): Promise<KPI[]> {
  await wait(400);
  return [
    { key: 'companies',   label: 'Covered Companies', value: 40 },
    { key: 'new_today',   label: 'New Items (Today)', value: 12, delta: +3 },
    { key: 'new_7d',      label: 'New Items (7d)',    value: 198, delta: -7 },
    { key: 'open_alerts', label: 'Open Alerts',       value: 26 },
    { key: 'market_risk', label: 'Market Risk Index', value: 63 },
  ];
}

let cursorSeed = 0;
export type EventsPage = { items: EventItem[]; nextCursor?: string };

export async function getEventsPage(cursor?: string): Promise<EventsPage> {
  await wait(500);
  const page = cursor ? parseInt(cursor, 10) : 0;
  const items: EventItem[] = Array.from({ length: 10 }).map((_, i) => {
    const id = `${page}-${i}-${++cursorSeed}`;
    const sev = ['Low','Medium','High','Critical'][Math.floor(Math.random()*4)] as EventItem['severity'];
    const sent = ['neg','neu','pos'][Math.floor(Math.random()*3)] as EventItem['sentiment'];
    const types = ['Earnings','Guidance','Exec Change','Litigation','Debt','ESG'];
    return {
      id,
      company: ['SABIC','Aramco','Etisalat','ADNOC','Commercial Bank of Qatar'][Math.floor(Math.random()*5)],
      type: types[Math.floor(Math.random()*types.length)],
      time: new Date(Date.now() - (page*10+i)*3600_000).toISOString(),
      severity: sev,
      sentiment: sent,
      summary: 'Auto-generated mock event summary for preview purposes.',
      source: ['Tadawul','DFM','EGX','News'][Math.floor(Math.random()*4)],
    };
  });
  return { items, nextCursor: page < 4 ? String(page + 1) : undefined }; // 5 صفحات
}

