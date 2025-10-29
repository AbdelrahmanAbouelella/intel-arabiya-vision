export type RiskWeights = {
  volatility: number;      // 0–100
  leverage: number;        // 0–100
  neg_event_rate: number;  // 0–100
  sentiment_trend: number; // 0–100
  exec_churn: number;      // 0–100
  filing_delays: number;   // 0–100
};

export type ApiKey = {
  id: string;
  label: string;
  created_at: string;
  last_used_at?: string;
  scopes: string[];  // ["read:companies","write:alerts"]
  active: boolean;
  token_preview: string; // أول 8 حروف للعرض فقط
};

export type AuditItem = {
  id: string;
  actor: string;
  action: string;     // "risk.update" | "apikey.create" | ...
  entity?: string;    // "RiskWeights" | "ApiKey"
  entity_id?: string;
  before?: any;
  after?: any;
  at: string;
  ip?: string;
  ua?: string;
};

