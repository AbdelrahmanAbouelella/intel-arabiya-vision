import type { ApiKey, AuditItem, RiskWeights } from "@/types/admin";

const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

let weights: RiskWeights = {
  volatility: 30,
  leverage: 20,
  neg_event_rate: 20,
  sentiment_trend: 15,
  exec_churn: 10,
  filing_delays: 5,
};

let keys: ApiKey[] = [
  { id: "k-1", label: "Backend service", created_at: new Date().toISOString(), scopes: ["read:*"], active: true, token_preview:"sk_live_ab12cd34" }
];

let audit: AuditItem[] = [];

function addAudit(auditItem: Omit<AuditItem,"id"|"at">) {
  audit.push({
    id: "a-"+(audit.length+1),
    at: new Date().toISOString(),
    ip: "127.0.0.1",
    ua: "mock",
    ...auditItem
  });
}

export async function getRiskWeights(): Promise<RiskWeights> {
  await wait(80);
  return JSON.parse(JSON.stringify(weights));
}

export async function updateRiskWeights(newW: RiskWeights): Promise<void> {
  await wait(150);
  const before = { ...weights };
  weights = { ...newW };
  addAudit({ actor:"admin@org", action:"risk.update", entity:"RiskWeights", before, after: newW });
}

export async function previewRiskScore(components: Partial<RiskWeights>): Promise<{ score:number; breakdown: Record<string,number>}> {
  // موك: نجمع الأوزان بعد التطبيع (0..100) ونرجع score افتراضي
  await wait(80);
  const current = { ...weights, ...components } as RiskWeights;
  const total = Object.values(current).reduce((a,b)=>a+b,0);
  const norm = total ? total / 6 : 0;
  return { score: Math.round(norm), breakdown: current };
}

export async function listApiKeys(): Promise<ApiKey[]> {
  await wait(80);
  return JSON.parse(JSON.stringify(keys));
}

export async function createApiKey(label: string, scopes: string[]): Promise<{id:string; token_preview:string}> {
  await wait(150);
  const id = "k-" + (keys.length+1);
  const token_preview = "sk_live_" + Math.random().toString(36).slice(2,10);
  keys.push({ id, label, created_at:new Date().toISOString(), scopes, active:true, token_preview });
  addAudit({ actor:"admin@org", action:"apikey.create", entity:"ApiKey", entity_id:id, after:{label,scopes} });
  return { id, token_preview };
}

export async function toggleApiKey(id:string, active:boolean): Promise<void> {
  await wait(80);
  const k = keys.find(x=>x.id===id);
  if (k) {
    const before = { active: k.active };
    k.active = active;
    addAudit({ actor:"admin@org", action:"apikey.toggle", entity:"ApiKey", entity_id:id, before, after:{ active } });
  }
}

export async function deleteApiKey(id:string): Promise<void> {
  await wait(80);
  keys = keys.filter(k=>k.id!==id);
  addAudit({ actor:"admin@org", action:"apikey.delete", entity:"ApiKey", entity_id:id });
}

export async function listAudit(): Promise<AuditItem[]> {
  await wait(80);
  return JSON.parse(JSON.stringify(audit.slice(-100))).reverse();
}

