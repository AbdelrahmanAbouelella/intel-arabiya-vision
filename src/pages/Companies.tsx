import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Link, useSearchParams } from 'react-router-dom';
import type { CompaniesQuery, CompanyRow } from '@/types/companies';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listCompanies as listCompaniesData } from '@/services/data/companies';
import FiltersBar from '@/components/companies/FiltersBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useSelection } from '@/contexts/SelectionContext';

type ListParams = CompaniesQuery & { limit?: number; cursor?: string };

export default function CompaniesPageSafe() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<CompaniesQuery>({});
  const [defaultWl, setDefaultWl] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [debouncedQuery, setDebouncedQuery] = useState<string | undefined>(undefined);
  const { setSelectedIds } = useSelection();

  useEffect(() => {
    (async ()=>{
      const wl = await import('@/services/mockWatchlists');
      const x = await wl.listWatchlists();
      setDefaultWl(x[0]?.id);
    })();
  }, []);

  useEffect(() => {
    const getNum = (k: string): number | undefined => {
      const v = searchParams.get(k);
      return v === null || v === '' ? undefined : Number(v);
    };
    const initial: CompaniesQuery = {
      query: searchParams.get('query') || undefined,
      sector: searchParams.get('sector') || undefined,
      country: searchParams.get('country') || undefined,
      exchange: searchParams.get('exchange') || undefined,
      mcap_min: getNum('mcap_min'),
      mcap_max: getNum('mcap_max'),
      risk_min: getNum('risk_min'),
      risk_max: getNum('risk_max'),
    };
    setFilters(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce query into URL
  useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(filters.query || undefined), 300);
    return () => clearTimeout(h);
  }, [filters.query]);

  useEffect(() => {
    const params: Record<string, string> = {};
    const push = (k: keyof CompaniesQuery) => {
      const v = filters[k];
      if (v !== undefined && v !== '' && v !== null) params[k as string] = String(v);
    };
    if (debouncedQuery && debouncedQuery !== '') params['query'] = debouncedQuery;
    push('sector'); push('country'); push('exchange');
    push('mcap_min'); push('mcap_max'); push('risk_min'); push('risk_max');
    setSearchParams(params, { replace: true });
  }, [filters.sector, filters.country, filters.exchange, filters.mcap_min, filters.mcap_max, filters.risk_min, filters.risk_max, debouncedQuery, setSearchParams]);

  const api = useMemo(() => ({
    listCompanies: async (params: ListParams) => {
      const limit = params.limit ?? 25;
      const offset = (params as any).offset ?? (params.cursor ? Number(params.cursor) || 0 : 0);
      const { items, total } = await listCompaniesData({
        query: params.query,
        sector: params.sector,
        country: params.country,
        limit,
        offset,
      });
      // emulate cursor paging contract
      const hasMore = offset + items.length < total;
      return { items, cursor_next: hasMore ? String(offset + limit) : undefined } as any;
    },
  }), []);

  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['companies', filters],
    queryFn: ({ pageParam }) => api.listCompanies({ ...filters, cursor: pageParam, limit: 25 }),
    initialPageParam: 0 as number,
    getNextPageParam: (last) => (last as any)?.cursor_next,
    enabled: true,
  });

  const rows: CompanyRow[] = useMemo(() => ((pages as any)?.pages ?? []).flatMap((p: any) => p.items), [pages]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Companies</h1>

        <FiltersBar
          value={filters}
          onChange={(f)=>{ setFilters(f); const empty = new Set<string>(); setSelected(empty); setSelectedIds([]); }}
          onReset={() => { setFilters({}); setSearchParams({}); const empty = new Set<string>(); setSelected(empty); setSelectedIds([]); }}
          onSearch={() => { /* auto-refetch via queryKey */ }}
        />

        <div className="rounded-xl border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={rows.length>0 && selected.size===rows.length}
                    onChange={(e)=>{
                      if (e.target.checked) setSelected(new Set(rows.map(r=>r.id)));
                      else setSelected(new Set());
                      const ids = e.target.checked ? rows.map(r=>r.id) : [];
                      setSelectedIds(ids);
                    }}
                  />
                </th>
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
              {!pages && isFetching && (
                <tr><td className="p-2" colSpan={9}>
                  <div className="space-y-2 p-2">
                    {Array.from({length:6}).map((_,i)=> <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                </td></tr>
              )}
              {rows.map(row => {
                const risk = (row as any).risk_score ?? 0;
                const color = risk>70?'text-red-600':risk>40?'text-amber-600':'text-green-600';
                const isSel = selected.has(row.id);
                return (
                  <tr key={row.id} className={`hover:bg-muted/30 border-t ${isSel ? 'bg-muted/20' : ''}`}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={(e)=>{
                          const next = new Set(selected);
                          if (e.target.checked) next.add(row.id); else next.delete(row.id);
                          setSelected(next);
                          setSelectedIds(Array.from(next));
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <Link to={`/company/${row.id}`} className="underline">
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
                      {(row as any).last_event_summary?.text ?? '—'}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !isFetching && (
                <tr><td className="p-4 text-muted-foreground">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            className="h-10 rounded-md border px-3 text-sm"
            disabled={!defaultWl || selected.size === 0}
            onClick={async ()=>{
              if (!defaultWl) { toast({ description: 'No watchlist found. Create one first.' }); return; }
              const ids = Array.from(selected);
              try {
                const { addCompaniesToWatchlist } = await import('@/services/mockWatchlists');
                await addCompaniesToWatchlist(defaultWl!, ids);
                toast({ description: `Added ${ids.length} companies to watchlist.` });
              } catch (e:any) {
                toast({ description: e?.message || 'Failed to add to watchlist' });
              }
            }}
          >
            Add to Watchlist
          </button>
        </div>

        <div className="flex justify-center py-3">
          <button
            className="h-10 rounded-md border px-3 text-sm"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetching}
          >
            {hasNextPage ? (isFetching ? 'Loading…' : 'Load more') : 'No more'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
