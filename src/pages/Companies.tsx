<<<<<<< HEAD
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Link } from 'react-router-dom';
import type { CompaniesQuery, CompanyRow } from '@/types/companies';
import { getCompanies } from '@/services/mockCompanies';
import { addCompaniesToWatchlist, listWatchlists } from '@/services/mockWatchlists';

type SavedView = { id:string; name:string }; // placeholder, not used in fallback

export default function CompaniesPageSafe() {
  const [filters, setFilters] = useState<CompaniesQuery>({
    query: '',
    sector: '',
    country: '',
    exchange: '',
    risk_min: 0,
    risk_max: 100,
  });

  const [data, setData] = useState<CompanyRow[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [defaultWl, setDefaultWl] = useState<string | undefined>(undefined);

  async function runSearch(reset = true) {
    setLoading(true);
    try {
      const page = await getCompanies(filters, reset ? undefined : cursor);
      setData(prev => reset ? page.items : [...prev, ...page.items]);
      setCursor(page.cursor_next);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runSearch(true); }, []);
  useEffect(() => { listWatchlists().then(x => setDefaultWl(x[0]?.id)); }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Companies</h1>

        {/* Fallback Filters (pure HTML) */}
        <div className="rounded-xl border bg-card p-3">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Search</label>
              <input
                className="w-full h-10 rounded-md border px-3 text-sm"
                placeholder="Name / Ticker / ISIN"
                value={filters.query || ''}
                onChange={e => setFilters({ ...filters, query: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Sector</label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm"
                value={filters.sector || ''}
                onChange={e => setFilters({ ...filters, sector: e.target.value || undefined })}
              >
                <option value="">All</option>
                <option>Banks</option>
                <option>Energy</option>
                <option>Telecom</option>
                <option>Materials</option>
                <option>Consumer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Country</label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm"
                value={filters.country || ''}
                onChange={e => setFilters({ ...filters, country: e.target.value || undefined })}
              >
                <option value="">All</option>
                <option>KSA</option>
                <option>UAE</option>
                <option>Egypt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Exchange</label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm"
                value={filters.exchange || ''}
                onChange={e => setFilters({ ...filters, exchange: e.target.value || undefined })}
              >
                <option value="">All</option>
                <option>Tadawul</option>
                <option>DFM</option>
                <option>EGX</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-5 items-end">
            <div className="md:col-span-3">
              <label className="block text-sm mb-1">Risk band (0–100)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-24 h-10 rounded-md border px-2 text-sm"
                  value={filters.risk_min ?? 0}
                  onChange={e => setFilters({ ...filters, risk_min: Number(e.target.value) })}
                />
                <span>to</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-24 h-10 rounded-md border px-2 text-sm"
                  value={filters.risk_max ?? 100}
                  onChange={e => setFilters({ ...filters, risk_max: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                className="h-10 rounded-md border px-3 text-sm"
                onClick={() => setFilters({ query:'', sector:'', country:'', exchange:'', risk_min:0, risk_max:100 })}
              >
                Reset
              </button>
              <button
                className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground"
                onClick={() => runSearch(true)}
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Simple Results Table (no TanStack) */}
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Sector</th>
                <th className="p-2 text-left">Country</th>
                <th className="p-2 text-left">Ticker</th>
                <th className="p-2 text-left">Revenue</th>
                <th className="p-2 text-left">Net Income</th>
                <th className="p-2 text-left">Risk</th>
                <th className="p-2 text-left">Last Event</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => {
                const risk = row.risk_score ?? 0;
                const color = risk>70?'text-red-600':risk>40?'text-amber-600':'text-green-600';
                return (
                  <tr key={row.id} className="hover:bg-muted/30 border-t">
                    <td className="p-2">
                      <Link to={`/company?id=${row.id}`} className="underline">
                        {row.name_en}
                      </Link>
                    </td>
                    <td className="p-2">{row.sector}</td>
                    <td className="p-2">{row.country}</td>
                    <td className="p-2">{row.ticker ?? '—'}</td>
                    <td className="p-2">{row.revenue_last ? row.revenue_last.toLocaleString() : '—'}</td>
                    <td className="p-2">{row.net_income_last ? row.net_income_last.toLocaleString() : '—'}</td>
                    <td className={`p-2 font-medium ${color}`}>{risk}</td>
                    <td className="p-2 text-muted-foreground">
                      {row.last_event_summary?.text ?? '—'}
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr><td className="p-4 text-muted-foreground">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            className="h-10 rounded-md border px-3 text-sm"
            disabled={!defaultWl || data.length === 0}
            onClick={async ()=>{
              const ids = data.slice(0,5).map(r=>r.id); // Demo: أول 5
              await addCompaniesToWatchlist(defaultWl!, ids);
              alert(`Added ${ids.length} to watchlist ( ${defaultWl} )`);
            }}
          >
            Add 5 to Watchlist (demo)
          </button>
        </div>

        <div className="flex justify-center py-3">
          <button
            className="h-10 rounded-md border px-3 text-sm"
            onClick={() => runSearch(false)}
            disabled={!cursor || loading}
          >
            {cursor ? (loading ? 'Loading…' : 'Load more') : 'No more'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
=======
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
                  <SelectItem value="banking">{t('sectors.banking')}</SelectItem>
                  <SelectItem value="real_estate">{t('sectors.real_estate')}</SelectItem>
                  <SelectItem value="retail">{t('sectors.retail')}</SelectItem>
                  <SelectItem value="energy">{t('sectors.energy')}</SelectItem>
                  <SelectItem value="telecom">{t('sectors.telecommunications')}</SelectItem>
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
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
