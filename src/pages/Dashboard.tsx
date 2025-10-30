import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EventsFeed from "@/components/dashboard/EventsFeed";
import HeatmapPlaceholder from "@/components/dashboard/HeatmapPlaceholder";
import KpiCard from "@/components/dashboard/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { KPI } from "@/types/dashboard";
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { USE_MOCKS } from "@/lib/runtime";
import { useMemo } from 'react';

const Dashboard = () => {
  const { t } = useTranslation();

  const api = useMemo(() => ({
    getKpis: async (): Promise<KPI[]> => {
      if (USE_MOCKS) {
        const { getDashboardKpis } = await import("@/services/mockApi");
        return getDashboardKpis();
      }
      const { getKpis } = await import("@/api/dashboard");
      return getKpis();
    },
    getMarketRiskIndex: async (): Promise<number> => {
      if (USE_MOCKS) {
        const { getDashboardKpis } = await import("@/services/mockApi");
        const list = await getDashboardKpis();
        const k = list.find(x => x.key === 'market_risk');
        return k?.value ?? 0;
      }
      const { getMarketRiskIndex } = await import("@/api/dashboard");
      return getMarketRiskIndex();
    },
    listLatestEvents: async ({ cursor, limit }: { cursor?: string; limit?: number }) => {
      if (USE_MOCKS) {
        const { getEventsPage } = await import("@/services/mockApi");
        const page = await getEventsPage(cursor);
        return { items: page.items, cursor_next: page.nextCursor };
      }
      const { listLatestEvents } = await import("@/api/dashboard");
      return listLatestEvents({ cursor, limit });
    }
  }), []);

  const { data: kpis, isLoading: loadingKpis } = useQuery({
    queryKey: ['kpis'],
    queryFn: api.getKpis,
    staleTime: 60_000,
  });

  const { data: risk, isLoading: loadingRisk } = useQuery({
    queryKey: ['marketRisk'],
    queryFn: api.getMarketRiskIndex,
    staleTime: 60_000,
  });

  const {
    data: eventsPages,
    fetchNextPage,
    hasNextPage,
    isFetching: loadingEvents,
  } = useInfiniteQuery({
    queryKey: ['events'],
    queryFn: ({ pageParam }) => api.listLatestEvents({ cursor: pageParam, limit: 20 }),
    getNextPageParam: (last) => last?.cursor_next,
    initialPageParam: undefined as string | undefined,
  });

  const events = (eventsPages?.pages ?? []).flatMap(p => p.items);

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time corporate intelligence and market insights
          </p>
        </div>

        {/* KPI Cards */}
        {loadingKpis ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({length:5}).map((_,i)=>
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {kpis?.map(k => <KpiCard key={k.key} kpi={k} />)}
          </div>
        )}

        {/* Market Risk Index */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-lg bg-gradient-card backdrop-blur-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold">{t('dashboard.marketRiskIndex')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                {loadingRisk ? (
                  <div className="w-40 space-y-3">
                    <Skeleton className="h-16 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="relative inline-block">
                      <div className="text-7xl font-bold text-warning drop-shadow-glow">
                        {risk}
                      </div>
                      <div className="absolute inset-0 blur-xl opacity-30 bg-warning rounded-full" />
                    </div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      Market volatility indicator
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-card backdrop-blur-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold">{t('dashboard.topRiskCompanies')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: replace with real Sector/Country treemap once ClickHouse/OpenSearch ready. */}
              <HeatmapPlaceholder />
            </CardContent>
          </Card>
        </div>

        {/* Events feed and Heatmap layout */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EventsFeed items={events} loading={loadingEvents} hasMore={!!hasNextPage} onLoadMore={() => fetchNextPage()} />
          </div>
          <div>
            {/* TODO: replace with real Sector/Country treemap once ClickHouse/OpenSearch ready. */}
            <HeatmapPlaceholder />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
