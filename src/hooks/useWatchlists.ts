import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export const useWatchlists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['watchlists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Watchlist[];
    },
    enabled: !!user,
  });
};

export const useCreateWatchlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: watchlist, error } = await supabase
        .from('watchlists')
        .insert([{ ...data, user_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return watchlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Watchlist created successfully');
    },
    onError: () => {
      toast.error('Failed to create watchlist');
    },
  });
};

export const useDeleteWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Watchlist deleted');
    },
    onError: () => {
      toast.error('Failed to delete watchlist');
    },
  });
};
