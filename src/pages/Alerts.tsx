import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAlertRules, useCreateAlertRule, useToggleAlertRule } from '@/hooks/useAlertRules';
import { PlusIcon, BellIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';

const Alerts = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const { data: alertRules, isLoading } = useAlertRules();
  const createAlertRule = useCreateAlertRule();
  const toggleAlertRule = useToggleAlertRule();

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createAlertRule.mutateAsync({
      name,
      severity,
      scope_filters: { sector: [], country: [] },
      conditions: { metric: 'revenue', operator: '<=', value: -10 },
      actions: { channels: ['email'] },
    });
    setName('');
    setSeverity('medium');
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('alerts.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('alerts.description')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('alerts.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('alerts.createRule')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('alerts.ruleName')}</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('alerts.ruleNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('alerts.severity')}</label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as 'low' | 'medium' | 'high' | 'critical')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('severity.low')}</SelectItem>
                      <SelectItem value="medium">{t('severity.medium')}</SelectItem>
                      <SelectItem value="high">{t('severity.high')}</SelectItem>
                    </SelectContent>
                  </Select>
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
        ) : alertRules && alertRules.length > 0 ? (
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BellIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle>{rule.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={rule.severity === 'high' ? 'destructive' : rule.severity === 'medium' ? 'default' : 'secondary'}>
                            {t(`severity.${rule.severity}`)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(rule.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {rule.is_active ? t('alerts.active') : t('alerts.inactive')}
                      </span>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) =>
                          toggleAlertRule.mutate({ id: rule.id, is_active: checked })
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t('alerts.empty')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Alerts;
