import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function HeatmapPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Sector/Country Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Placeholder — سنستبدلها لاحقًا بـ ECharts/Recharts + Drill-down.
      </CardContent>
    </Card>
  );
}

