import type { AlertHistoryItem, AlertRule, AlertTestResult } from "@/types/alerts";
import type { CompaniesQuery, CompanyRow } from "@/types/companies";
import { getCompanies } from "./mockCompanies";

const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

let rules: AlertRule[] = [
  {
    id: "r-1",
    name: "High risk (>=70) in KSA",
    active: true,
    scope: { country: "KSA" },
    condition: { metric: "risk_score", op: ">=", value: 70 },
    channels: ["web"],
    created_at: new Date().toISOString(),
  },
];

let history: AlertHistoryItem[] = [];

export async function listRules(): Promise<AlertRule[]> {
  await wait(80);
  return JSON.parse(JSON.stringify(rules));
}

export async function createRule(input: Omit<AlertRule, "id"|"created_at">): Promise<{id:string}> {
  await wait(120);
  const id = `r-${rules.length+1}`;
  rules.push({ ...input, id, created_at: new Date().toISOString() });
  return { id };
}

export async function toggleRule(id: string, active: boolean): Promise<void> {
  await wait(80);
  const r = rules.find(x=>x.id===id);
  if (r) r.active = active;
}

function applyRuleToRows(r: AlertRule, rows: CompanyRow[]): CompanyRow[] {
  const byScope = rows.filter(row => {
    if (r.scope?.country && row.country !== r.scope.country) return false;
    if (r.scope?.sector && row.sector !== r.scope.sector) return false;
    return true;
  });

  const metric = r.condition.metric;
  const val = r.condition.value;
  return byScope.filter(row => {
    const current = (row as any)[metric] ?? 0;
    return r.condition.op === ">=" ? current >= val : current <= val;
  });
}

export async function testRule(r: AlertRule): Promise<AlertTestResult> {
  // هات صفحتين من الشركات وطبّق الشرط
  const page1 = await getCompanies({} as CompaniesQuery, undefined);
  const page2 = await getCompanies({} as CompaniesQuery, page1.cursor_next);
  const all = [...page1.items, ...page2.items];

  const matches = applyRuleToRows(r, all).slice(0, 25).map(row => ({
    rule_id: r.id,
    company_id: row.id,
    company_name: row.name_en,
    when: new Date().toISOString(),
    snapshot: {
      risk_score: row.risk_score,
      revenue_last: row.revenue_last,
      country: row.country,
      sector: row.sector,
    },
  }));

  return { matches };
}

export async function listHistory(): Promise<AlertHistoryItem[]> {
  await wait(80);
  return JSON.parse(JSON.stringify(history.slice(-100))).reverse();
}

// تشغيل “موك” للإنذار: أضف نتائج الـtest إلى history
export async function runNow(id: string): Promise<number> {
  const r = rules.find(x=>x.id===id);
  if (!r) return 0;
  const test = await testRule(r);
  const items: AlertHistoryItem[] = test.matches.map(m => ({
    ...m,
    delivered_channels: r.channels,
    summary: `Rule '${r.name}' matched ${m.company_name} (${(m.snapshot.risk_score ?? 0)})`,
  }));
  history.push(...items);
  return items.length;
}

