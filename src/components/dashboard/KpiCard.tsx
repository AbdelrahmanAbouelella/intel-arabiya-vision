import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KPI } from "@/types/dashboard";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function KpiCard({ kpi }: { kpi: KPI }) {
  const deltaColor = kpi.delta && kpi.delta !== 0
    ? kpi.delta > 0 ? 'text-success' : 'text-destructive'
    : 'text-muted-foreground';

  return (
    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-card backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {kpi.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {kpi.value.toLocaleString()}
        </div>
        {typeof kpi.delta === 'number' && (
          <div className={`flex items-center gap-1 text-sm font-medium ${deltaColor}`}>
            {kpi.delta > 0 ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            <span>{Math.abs(kpi.delta)}%</span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

