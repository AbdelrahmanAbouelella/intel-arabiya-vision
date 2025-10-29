import type { CompanyRow } from "@/types/companies";

const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export type CompanyProfile = {
  profile: CompanyRow & {
    description?: string;
    stats?: { margin?: number; debt_to_equity?: number };
  };
  financials: { period: string; revenue: number; ebitda: number; net_income: number; margin: number }[];
  events: { id:string; time:string; type:string; severity:'Low'|'Medium'|'High'|'Critical'; summary:string }[];
  filings: { id:string; date:string; doc_type:string; url?:string }[];
  people: { name:string; role:string; since:string }[];
  forecast: { horizon:string; value:number; ci_low:number; ci_high:number; model_version:string; mape:number; mae:number }[];
  comparables: { id:string; name:string; growth:number; profitability:number; leverage:number; risk:number }[];
};

export async function getCompanyById(id: string): Promise<CompanyProfile> {
  await wait(300);

  const mk = (n:number)=>Math.floor(Math.random()*n);
  const base: CompanyRow = {
    id,
    name_en: ["SABIC","Aramco","Etisalat","ADNOC","QNB","Vodafone Egypt","Banque Misr"][mk(7)] + " " + id.slice(-2),
    sector: ["Banks","Energy","Telecom","Materials","Consumer"][mk(5)],
    country: ["KSA","UAE","Egypt"][mk(3)],
    exchange: ["Tadawul","DFM","EGX"][mk(3)],
    ticker: "TK"+mk(999),
    isin: "ISIN"+mk(99999),
    currency: ["SAR","AED","EGP"][mk(3)],
    revenue_last: 200_000_000 + mk(900_000_000),
    net_income_last: 20_000_000 + mk(300_000_000),
    risk_score: mk(100),
    last_event_summary: { lang:'en', text:'Last event summary (mock)'},
    sentiment: ['neg','neu','pos'][mk(3)] as any
  };

  const fin = Array.from({length:8}).map((_,i)=>{
    const revenue = 400_000_000 + mk(700_000_000);
    const net = 10_000_000 + mk(200_000_000);
    const ebitda = Math.floor(revenue*0.25);
    const margin = Math.round((net/revenue)*100);
    return { period: `Q${(i%4)+1} 202${3 - Math.floor(i/4)}`, revenue, ebitda, net_income: net, margin };
  });

  const ev = Array.from({length:10}).map((_,i)=>({
    id: `e-${i}`, time: new Date(Date.now()-i*36e5).toISOString(),
    type: ["Earnings","Guidance","Exec Change","Litigation","Debt","ESG"][mk(6)],
    severity: (["Low","Medium","High","Critical"] as const)[mk(4)],
    summary: "Mock event summary for preview purposes."
  }));

  const filings = Array.from({length:6}).map((_,i)=>({
    id:`f-${i}`, date:new Date(Date.now()-i*864e5).toISOString().slice(0,10),
    doc_type: ["Quarterly","Annual","Material"][mk(3)], url: "#"
  }));

  const people = [
    { name:"John Doe", role:"CEO", since:"2019-06-01" },
    { name:"Jane Smith", role:"CFO", since:"2021-03-15" },
    { name:"Ali Hassan", role:"COO", since:"2020-10-10" },
  ];

  const fc = Array.from({length:4}).map((_,i)=>{
    const v = 300_000_000 + mk(500_000_000);
    return { horizon:`Q+${i+1}`, value:v, ci_low:Math.floor(v*0.9), ci_high:Math.floor(v*1.1), model_version:"v1.0", mape:8+mk(6), mae: mk(10_000_000) };
  });

  const peers = Array.from({length:6}).map((_,i)=>({
    id:`p-${i}`, name:`Peer ${i+1}`,
    growth: mk(40), profitability: mk(40), leverage: mk(100), risk: mk(100)
  }));

  return {
    profile: { ...base, description: "Mock company description", stats:{ margin:18, debt_to_equity: 0.9 } },
    financials: fin, events: ev, filings, people, forecast: fc, comparables: peers
  };
}

