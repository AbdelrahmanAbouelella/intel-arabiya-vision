import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Alerts = () => {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('alerts.title')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('alerts.ruleBuilder')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Alert rule builder coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Alerts;
