import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CompanyProfile = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="space-y-6">
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
      </div>
    </AppLayout>
  );
};

export default CompanyProfile;
