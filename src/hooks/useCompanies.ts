import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  ticker: string | null;
  isin: string | null;
  sector: string;
  country: string;
  exchange: string | null;
  market_cap_usd: number | null;
  risk_score: number | null;
  logo_url: string | null;
  website: string | null;
}

export const useCompanies = (filters?: {
  sector?: string;
  country?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name_en', { ascending: true });

      if (filters?.sector) {
        query = query.eq('sector', filters.sector as any);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country as any);
      }
      if (filters?.search) {
        query = query.or(`name_en.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%,ticker.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Company[];
    },
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Company;
    },
    enabled: !!id,
  });
};
