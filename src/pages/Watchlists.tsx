import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import type { Watchlist } from '@/types/watchlists';
import { listWatchlists, createWatchlist, getWatchlistRollups, removeCompanyFromWatchlist } from '@/services/mockWatchlists';

export default function WatchlistsPage() {
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [roll, setRoll] = useState<Awaited<ReturnType<typeof getWatchlistRollups>> | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshLists() {
    const x = await listWatchlists();
    setLists(x);
    if (!activeId && x[0]) setActiveId(x[0].id);
  }

  async function refreshRollups(id: string | undefined) {
    if (!id) return;
    setLoading(true);
    try {
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
                await createWatchlist(name.trim());
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
