import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyProfile } from "@/types/api";

export default function StatsCards({ profile }: { profile: CompanyProfile }) {
  const p = profile.profile;
  const stats = [
    { label: 'Revenue (last)', value: p.revenue_last ? p.revenue_last.toLocaleString() : '—' },
    { label: 'Net Income (last)', value: p.net_income_last ? p.net_income_last.toLocaleString() : '—' },
    { label: 'Risk Score', value: typeof p.risk_score === 'number' ? String(p.risk_score) : '—' },
    { label: 'Margin', value: typeof p.stats?.margin === 'number' ? `${p.stats.margin}%` : '—' },
    { label: 'Debt / Equity', value: typeof p.stats?.debt_to_equity === 'number' ? String(p.stats.debt_to_equity) : '—' },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stats.map(s => (
        <Card key={s.label} className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

