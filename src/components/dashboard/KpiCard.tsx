import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KPI } from "@/types/dashboard";

export default function KpiCard({ kpi }: { kpi: KPI }) {
  const deltaColor = kpi.delta && kpi.delta !== 0
    ? kpi.delta > 0 ? 'text-green-600' : 'text-red-600'
    : 'text-muted-foreground';

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-bold">{kpi.value.toLocaleString()}</div>
        {typeof kpi.delta === 'number' && (
          <div className={`text-sm ${deltaColor}`}>
            {kpi.delta > 0 ? `+${kpi.delta}%` : `${kpi.delta}%`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

