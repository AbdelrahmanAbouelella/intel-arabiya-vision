import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import type { Watchlist, WatchlistRollups } from '@/types/watchlists';
import { USE_MOCKS } from '@/lib/runtime';
import { useSelection } from '@/contexts/SelectionContext';
import { useToast } from '@/components/ui/use-toast';

export default function WatchlistsPage() {
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [roll, setRoll] = useState<WatchlistRollups | null>(null);
  const [loading, setLoading] = useState(false);
  const { selectedIds } = useSelection();
  const { toast } = useToast();

  async function refreshLists() {
    const wl = USE_MOCKS ? await import('@/services/mockWatchlists') : await import('@/api/watchlists');
    const x = await wl.listWatchlists();
    setLists(x);
    if (!activeId && x[0]) setActiveId(x[0].id);
  }

  async function refreshRollups(id: string | undefined) {
    if (!id) return;
    setLoading(true);
    try {
      // rollups are only available in mock for now
      const { getWatchlistRollups } = await import('@/services/mockWatchlists');
      const r = await getWatchlistRollups(id);
      setRoll(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshLists(); }, []);
  useEffect(() => { refreshRollups(activeId); }, [activeId]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Watchlists</h1>

        <div className="rounded-xl border p-3">
          <div className="flex items-center gap-2">
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={activeId || ''}
              onChange={e => setActiveId(e.target.value || undefined)}
            >
              {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>

            <input
              className="h-10 rounded-md border px-3 text-sm"
              placeholder="New watchlist name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button
              className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground"
              onClick={async ()=>{
                if (!name.trim()) return;
                if (USE_MOCKS) {
                  const { createWatchlist } = await import('@/services/mockWatchlists');
                  await createWatchlist(name.trim());
                } else {
                  // no API create endpoint yet
                }
                setName('');
                await refreshLists();
              }}
            >
              Create
            </button>

            <button
              className="h-10 rounded-md border px-3 text-sm"
              onClick={()=>refreshRollups(activeId)}
              disabled={!activeId || loading}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button
              className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground"
              disabled={!activeId || selectedIds.length === 0}
              onClick={async ()=>{
                if (!activeId) return;
                if (selectedIds.length === 0) { toast({ description: 'No selected companies.' }); return; }
                try {
                  if (USE_MOCKS) {
                    const { addCompaniesToWatchlist } = await import('@/services/mockWatchlists');
                    await addCompaniesToWatchlist(activeId, selectedIds);
                  } else {
                    const { addCompaniesToWatchlist } = await import('@/api/watchlists');
                    await addCompaniesToWatchlist(activeId, selectedIds);
                  }
                  toast({ description: `Added ${selectedIds.length} companies.` });
                  await refreshRollups(activeId);
                } catch (e:any) {
                  toast({ description: e?.message || 'Failed to add companies' });
                }
              }}
            >
              Add Selected
            </button>
          </div>
        </div>

        {/* Rollups */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-3">
            <div className="text-sm text-muted-foreground">Companies in list</div>
            <div className="text-3xl font-bold">{roll?.count ?? 0}</div>
          </div>

          <div className="rounded-xl border p-3">
            <div className="font-semibold mb-2">Top Risk</div>
            <ul className="space-y-1">
              {(roll?.topRisk ?? []).map(r=>(
                <li key={r.id} className="flex justify-between">
                  <span>{r.name}</span>
                  <span className="text-red-600 font-medium">{r.risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border p-3">
            <div className="font-semibold mb-2">Low Risk</div>
            <ul className="space-y-1">
              {(roll?.lowRisk ?? []).map(r=>(
                <li key={r.id} className="flex justify-between">
                  <span>{r.name}</span>
                  <span className="text-green-600 font-medium">{r.risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="font-semibold mb-2">Top Revenue</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Revenue</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {(roll?.topRevenue ?? []).map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.revenue.toLocaleString()}</td>
                  <td className="p-2 text-right">
                    <button
                      className="h-8 rounded-md border px-3 text-xs"
                      onClick={async()=>{
                        if (!activeId) return;
                        const { removeCompanyFromWatchlist } = await import('@/services/mockWatchlists');
                        await removeCompanyFromWatchlist(activeId, r.id);
                        await refreshRollups(activeId);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {(!roll || roll.topRevenue.length === 0) && (
                <tr><td className="p-2 text-muted-foreground">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
