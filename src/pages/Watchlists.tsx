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
