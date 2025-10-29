import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Financial {
  id: string;
  company_id: string;
  period: string;
  period_type: string;
  revenue_usd: number | null;
  ebitda_usd: number | null;
  net_income_usd: number | null;
  total_assets_usd: number | null;
  total_debt_usd: number | null;
  shareholders_equity_usd: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  roe: number | null;
  debt_to_equity: number | null;
}

export const useFinancials = (companyId: string) => {
  return useQuery({
    queryKey: ['financials', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financials')
        .select('*')
        .eq('company_id', companyId)
        .order('period', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as Financial[];
    },
    enabled: !!companyId,
  });
};
