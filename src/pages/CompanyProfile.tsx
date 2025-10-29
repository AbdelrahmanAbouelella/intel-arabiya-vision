import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD

const CompanyProfile = () => {
  const { id } = useParams();
  const { t } = useTranslation();
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/hooks/useCompanies';
import { useFinancials } from '@/hooks/useFinancials';
import { useEvents } from '@/hooks/useEvents';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { data: company, isLoading: companyLoading } = useCompany(id!);
  const { data: financials } = useFinancials(id!);
  const { data: events } = useEvents(id!, 20);

  if (companyLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('companies.notFound')}</p>
        </div>
      </AppLayout>
    );
  }

  const companyName = i18n.language === 'ar' && company.name_ar ? company.name_ar : company.name_en;
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7

  return (
    <AppLayout>
      <div className="space-y-6">
<<<<<<< HEAD
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('company.overview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Company details coming soon...</p>
          </CardContent>
        </Card>
=======
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{companyName}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {company.ticker && <span>{company.ticker}</span>}
              {company.country && <span>• {t(`countries.${company.country}`)}</span>}
              {company.sector && <span>• {t(`sectors.${company.sector}`)}</span>}
            </div>
          </div>
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-2">
                <GlobeAltIcon className="h-4 w-4" />
                {t('company.website')}
              </Badge>
            </a>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('company.riskScore')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (company.risk_score ?? 50) >= 70 ? 'text-destructive' :
                (company.risk_score ?? 50) >= 50 ? 'text-warning' :
                'text-success'
              }`}>
                {company.risk_score ?? 50}
              </div>
            </CardContent>
          </Card>
          {financials && financials[0] && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('financials.revenue')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${((financials[0].revenue_usd ?? 0) / 1_000_000).toFixed(0)}M
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('financials.netIncome')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${((financials[0].net_income_usd ?? 0) / 1_000_000).toFixed(0)}M
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('financials.debtToEquity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {financials[0].debt_to_equity?.toFixed(2) ?? '-'}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">{t('company.overview')}</TabsTrigger>
            <TabsTrigger value="financials">{t('company.financials')}</TabsTrigger>
            <TabsTrigger value="events">{t('company.events')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('company.overview')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t('company.description')}</h3>
                  <p className="text-muted-foreground">
                    {i18n.language === 'ar' && company.description_ar
                      ? company.description_ar
                      : company.description_en || t('company.noDescription')}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground">{t('company.isin')}</span>
                    <p className="font-medium">{company.isin || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t('company.exchange')}</span>
                    <p className="font-medium">{company.exchange || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t('company.marketCap')}</span>
                    <p className="font-medium">
                      {company.market_cap_usd
                        ? `$${(company.market_cap_usd / 1_000_000_000).toFixed(2)}B`
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('company.financials')}</CardTitle>
              </CardHeader>
              <CardContent>
                {financials && financials.length > 0 ? (
                  <div className="space-y-4">
                    {financials.map((f) => (
                      <div key={f.id} className="border-b pb-4 last:border-0">
                        <div className="font-semibold mb-2">{f.period} ({f.period_type})</div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <span className="text-sm text-muted-foreground">{t('financials.revenue')}</span>
                            <p className="font-medium">${((f.revenue_usd ?? 0) / 1_000_000).toFixed(1)}M</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">{t('financials.netIncome')}</span>
                            <p className="font-medium">${((f.net_income_usd ?? 0) / 1_000_000).toFixed(1)}M</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">{t('financials.netMargin')}</span>
                            <p className="font-medium">{f.net_margin ? `${(f.net_margin * 100).toFixed(1)}%` : '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('financials.noData')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('company.events')}</CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {i18n.language === 'ar' && event.title_ar ? event.title_ar : event.title_en}
                              </h3>
                              <Badge variant={event.severity === 'high' ? 'destructive' : event.severity === 'medium' ? 'default' : 'secondary'}>
                                {t(`severity.${event.severity}`)}
                              </Badge>
                              <Badge variant="outline">{t(`sentiment.${event.sentiment}`)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(event.event_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                            </p>
                            {(event.summary_en || event.summary_ar) && (
                              <p className="text-sm">
                                {i18n.language === 'ar' && event.summary_ar ? event.summary_ar : event.summary_en}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">{t(`eventTypes.${event.event_type}`)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('events.noData')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
      </div>
    </AppLayout>
  );
};

export default CompanyProfile;
