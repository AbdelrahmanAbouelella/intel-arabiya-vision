import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { USE_MOCKS } from '@/lib/runtime';
import type { CompanyProfile as ProfileType, FinancialSeries } from '@/types/api';
import StatsCards from '@/components/company/StatsCards';
import FinancialChart from '@/components/company/FinancialChart';
import EventsTimeline from '@/components/company/EventsTimeline';
import FilingsTable from '@/components/company/FilingsTable';
import PeopleList from '@/components/company/PeopleList';
import ForecastChart from '@/components/company/ForecastChart';

const CompanyProfile = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const api = {
    getCompany: async (id: string, lang?: string): Promise<ProfileType> => {
      if (USE_MOCKS) {
        const { getCompanyById } = await import('@/services/mockCompanyDetails');
        return getCompanyById(id) as unknown as ProfileType;
      }
      const { getCompany } = await import('@/api/companies');
      return getCompany(id, { lang });
    },
    getFinancials: async (id: string, freq: 'quarterly'|'annual', periods: number): Promise<FinancialSeries> => {
      if (USE_MOCKS) {
        const { getCompanyFinancials } = await import('@/services/mockCompanyDetails');
        return getCompanyFinancials(id, freq, periods) as unknown as FinancialSeries;
      }
      const { getCompanyFinancials } = await import('@/api/companies');
      return getCompanyFinancials(id, freq, periods);
    },
    listEvents: async (id: string, params: { limit?: number; cursor?: string }) => {
      if (USE_MOCKS) {
        const { getCompanyEvents } = await import('@/services/mockCompanyDetails');
        return getCompanyEvents(id, params);
      }
      const { getCompanyEvents } = await import('@/api/companies');
      return getCompanyEvents(id, params as any);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['company', id, language],
    queryFn: () => api.getCompany(id!, language),
    enabled: !!id,
  });

  const [freq, setFreq] = useState<'quarterly'|'annual'>('quarterly');
  const [periods, setPeriods] = useState<number>(8);
  const { data: financials } = useQuery({
    queryKey: ['financials', id, freq, periods],
    queryFn: () => api.getFinancials(id!, freq, periods),
    enabled: !!id,
  });

  const {
    data: eventsPages,
    fetchNextPage: fetchNextEvents,
    hasNextPage: hasMoreEvents,
    isFetching: loadingEvents,
  } = useInfiniteQuery({
    queryKey: ['events', id],
    queryFn: ({ pageParam }) => api.listEvents(id!, { cursor: pageParam, limit: 20 }),
    getNextPageParam: (last) => last?.cursor_next,
    initialPageParam: undefined as string | undefined,
    enabled: !!id,
  });

  const events = (eventsPages?.pages ?? []).flatMap(p => p.items);

  const { data: forecastItems } = useQuery({
    queryKey: ['forecast', id, 'revenue', USE_MOCKS],
    queryFn: async () => {
      if (USE_MOCKS) {
        // use embedded forecast from profile when mocks
        return (profile as any)?.forecast ?? [];
      } else {
        const { getCompanyForecast } = await import('@/api/companies');
        const res = await getCompanyForecast(id!, 'revenue');
        return res.items ?? [];
      }
    },
    enabled: !!id,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{profile?.profile.name_en ?? 'Company'}</h1>
          <p className="text-muted-foreground">{profile?.profile.sector} • {profile?.profile.country}</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">{t('company.overview')}</TabsTrigger>
            <TabsTrigger value="financials">{t('company.financials')}</TabsTrigger>
            <TabsTrigger value="events">{t('company.events')}</TabsTrigger>
            <TabsTrigger value="filings">{t('company.filings')}</TabsTrigger>
            <TabsTrigger value="people">{t('company.people')}</TabsTrigger>
            <TabsTrigger value="forecast">{t('company.forecast')}</TabsTrigger>
          </TabsList>

          <div aria-live="polite">
            <TabsContent value="overview">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {(profile as any)?.ai_summary?.[language] || '—'}
                    </p>
                  </CardContent>
                </Card>

                {profile && <StatsCards profile={profile} />}
              </div>
            </TabsContent>

            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>Financials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <label className="text-sm">Frequency:</label>
                    <select aria-label="Frequency" className="h-9 rounded-md border px-2 text-sm" value={freq} onChange={e=>setFreq(e.target.value as any)}>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                    <label className="text-sm">Periods:</label>
                    <select aria-label="Periods" className="h-9 rounded-md border px-2 text-sm" value={periods} onChange={e=>setPeriods(Number(e.target.value))}>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                  {financials ? <FinancialChart series={financials as any} /> : <div className="text-sm text-muted-foreground">Loading…</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>News & Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventsTimeline items={events as any} loading={loadingEvents} hasMore={!!hasMoreEvents} onLoadMore={() => fetchNextEvents()} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filings">
              <Card>
                <CardHeader>
                  <CardTitle>Filings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilingsTable items={profile?.filings ?? []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="people">
              <Card>
                <CardHeader>
                  <CardTitle>People</CardTitle>
                </CardHeader>
                <CardContent>
                  <PeopleList items={profile?.people ?? []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecast">
              <Card>
                <CardHeader>
                  <CardTitle>Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ForecastChart
                    series={(forecastItems as any) ?? []}
                    meta={{
                      model_version: (forecastItems as any)?.[0]?.model_version,
                      mape: (forecastItems as any)?.[0]?.mape,
                      mae: (forecastItems as any)?.[0]?.mae,
                      retrained_at: (forecastItems as any)?.[0]?.retrained_at,
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CompanyProfile;
