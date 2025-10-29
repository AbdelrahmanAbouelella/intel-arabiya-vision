export type AlertRule = {
  id: string;
  name: string;
  active: boolean;
  // نطاق بسيط: شركة/قطاع/دولة + عتبات
  scope?: { sector?: string; country?: string; watchlistId?: string };
  // شرط: risk >= X أو revenue >= Y أو sentiment avg <= Z (موك)
  condition: {
    metric: "risk_score" | "revenue_last";
    op: ">=" | "<=";
    value: number;
  };
  channels: string[]; // ["email:me@x.com","web"]
  created_at: string;
};

export type AlertMatch = {
  rule_id: string;
  company_id: string;
  company_name: string;
  when: string;
  snapshot: Record<string, unknown>;
};

export type AlertTestResult = {
  matches: AlertMatch[];
};

export type AlertHistoryItem = AlertMatch & {
  delivered_channels: string[];
  summary: string;
};

