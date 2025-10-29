import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompanies } from '@/hooks/useCompanies';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Companies = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  const { data: companies, isLoading } = useCompanies({
    search: search || undefined,
    sector: sector || undefined,
    country: country || undefined,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.companies')}</h1>
          <p className="text-muted-foreground mt-2">{t('companies.searchDescription')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('nav.search')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('companies.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder={t('companies.allSectors')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('companies.allSectors')}</SelectItem>
                  <SelectItem value="banking">{t('sectors.banking')}</SelectItem>
                  <SelectItem value="real_estate">{t('sectors.real_estate')}</SelectItem>
                  <SelectItem value="retail">{t('sectors.retail')}</SelectItem>
                  <SelectItem value="energy">{t('sectors.energy')}</SelectItem>
                  <SelectItem value="telecom">{t('sectors.telecom')}</SelectItem>
                  <SelectItem value="healthcare">{t('sectors.healthcare')}</SelectItem>
                  <SelectItem value="industrial">{t('sectors.industrial')}</SelectItem>
                  <SelectItem value="technology">{t('sectors.technology')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder={t('companies.allCountries')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('companies.allCountries')}</SelectItem>
                  <SelectItem value="SA">{t('countries.SA')}</SelectItem>
                  <SelectItem value="AE">{t('countries.AE')}</SelectItem>
                  <SelectItem value="EG">{t('countries.EG')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
            ) : companies && companies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('company.name')}</TableHead>
                    <TableHead>{t('company.ticker')}</TableHead>
                    <TableHead>{t('company.sector')}</TableHead>
                    <TableHead>{t('company.country')}</TableHead>
                    <TableHead className="text-right">{t('company.riskScore')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/company/${company.id}`)}>
                      <TableCell className="font-medium">{company.name_en}</TableCell>
                      <TableCell>{company.ticker || '-'}</TableCell>
                      <TableCell>{t(`sectors.${company.sector}`)}</TableCell>
                      <TableCell>{t(`countries.${company.country}`)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${
                          (company.risk_score ?? 50) >= 70 ? 'text-destructive' :
                          (company.risk_score ?? 50) >= 50 ? 'text-warning' :
                          'text-success'
                        }`}>
                          {company.risk_score ?? 50}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">{t('common.view')}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t('companies.noResults')}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Companies;
