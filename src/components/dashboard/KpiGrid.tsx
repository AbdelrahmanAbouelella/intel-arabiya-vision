import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import { getDashboardKpis } from "@/services/mockApi";
import type { KPI } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function KpiGrid() {
  const [data, setData] = useState<KPI[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardKpis().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({length:5}).map((_,i)=>
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {data?.map(k => <KpiCard key={k.key} kpi={k} />)}
    </div>
  );
}

