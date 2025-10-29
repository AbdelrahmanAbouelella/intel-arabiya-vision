import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  scope_filters: any;
  conditions: any;
  actions: any;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAlertRules = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['alert-rules', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AlertRule[];
    },
    enabled: !!user,
  });
};

export const useCreateAlertRule = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      scope_filters: any;
      conditions: any;
      actions: any;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }) => {
      const { data: rule, error } = await supabase
        .from('alert_rules')
        .insert([{ ...data, user_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast.success('Alert rule created');
    },
    onError: () => {
      toast.error('Failed to create alert rule');
    },
  });
};

export const useToggleAlertRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('alert_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });
};
