export type KPI = {
  key: 'companies' | 'new_today' | 'new_7d' | 'open_alerts' | 'market_risk';
  label: string;
  value: number;
  delta?: number; // نسبة التغيّر إن وجِدت
};

export type EventItem = {
  id: string;
  company: string;
  type: string; // Earnings | Guidance | ExecChange | ...
  time: string; // ISO string
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'neg' | 'neu' | 'pos';
  summary: string;
  source: string; // "Tadawul", "DFM", "News"
};

