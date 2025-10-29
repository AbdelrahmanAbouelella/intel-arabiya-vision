<<<<<<< HEAD
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
=======
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWatchlists, useCreateWatchlist, useDeleteWatchlist } from '@/hooks/useWatchlists';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const Watchlists = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: watchlists, isLoading } = useWatchlists();
  const createWatchlist = useCreateWatchlist();
  const deleteWatchlist = useDeleteWatchlist();

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createWatchlist.mutateAsync({ name, description: description || undefined });
    setName('');
    setDescription('');
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('watchlists.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('watchlists.description')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('watchlists.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('watchlists.createNew')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('watchlists.name')}</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('watchlists.namePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('watchlists.description')}</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('watchlists.descriptionPlaceholder')}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>
                  {t('common.create')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t('common.loading')}</p>
            </CardContent>
          </Card>
        ) : watchlists && watchlists.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {watchlists.map((watchlist) => (
              <Card key={watchlist.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{watchlist.name}</CardTitle>
                      {watchlist.description && (
                        <p className="text-sm text-muted-foreground mt-1">{watchlist.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWatchlist.mutate(watchlist.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(watchlist.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t('watchlists.empty')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Watchlists;
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
