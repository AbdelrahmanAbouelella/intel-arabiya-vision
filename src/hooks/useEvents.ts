import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  company_id: string;
  event_type: string;
  title_en: string;
  title_ar: string | null;
  summary_en: string | null;
  summary_ar: string | null;
  event_date: string;
  severity: string;
  sentiment: string;
  source_url: string | null;
  source_type: string | null;
  created_at: string;
}

export const useEvents = (companyId?: string, limit = 10) => {
  return useQuery({
    queryKey: ['events', companyId, limit],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
        .limit(limit);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
};
