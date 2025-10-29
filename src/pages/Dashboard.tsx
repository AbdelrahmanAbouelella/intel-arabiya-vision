import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD
import KpiGrid from "@/components/dashboard/KpiGrid";
import EventsFeed from "@/components/dashboard/EventsFeed";
import HeatmapPlaceholder from "@/components/dashboard/HeatmapPlaceholder";
=======
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  BellAlertIcon,
  ChartBarSquareIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { t } = useTranslation();

  const kpis = [
    { label: t('dashboard.companiesCovered'), value: '247', icon: BuildingOfficeIcon, color: 'text-chart-1' },
    { label: t('dashboard.newItemsToday'), value: '42', icon: DocumentTextIcon, color: 'text-chart-2' },
    { label: t('dashboard.newItemsWeek'), value: '318', icon: DocumentTextIcon, color: 'text-chart-3' },
    { label: t('dashboard.openAlerts'), value: '12', icon: BellAlertIcon, color: 'text-warning' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.marketRiskIndex')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl font-bold text-warning mb-2">58</div>
                  <p className="text-muted-foreground">Moderate Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.topRiskCompanies')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Company A', sector: 'Banking', risk: 78 },
                  { name: 'Company B', sector: 'Real Estate', risk: 72 },
                  { name: 'Company C', sector: 'Retail', risk: 65 },
                ].map((company) => (
                  <div key={company.name} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.sector}</div>
                    </div>
                    <div className="text-destructive font-bold">{company.risk}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
<<<<<<< HEAD

      {/* Added: Dashboard blocks (KPI grid, Events feed, Heatmap) */}
      <div className="space-y-4">
        <KpiGrid />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EventsFeed />
          </div>
          <div>
            <HeatmapPlaceholder />
          </div>
        </div>
      </div>
=======
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
    </AppLayout>
  );
};

export default Dashboard;
