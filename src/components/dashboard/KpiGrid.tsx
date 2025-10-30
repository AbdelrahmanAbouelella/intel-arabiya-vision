import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import type { KPI } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { USE_MOCKS } from "@/lib/runtime";

export default function KpiGrid() {
  const [data, setData] = useState<KPI[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (USE_MOCKS) {
          const { getDashboardKpis } = await import("@/services/mockApi");
          setData(await getDashboardKpis());
        } else {
          const { getKpis } = await import("@/api/dashboard");
          setData(await getKpis());
        }
      } finally {
        setLoading(false);
      }
    })();
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
