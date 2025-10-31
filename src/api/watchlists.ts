import { supabase } from "@/integrations/supabase/client";
import type { Watchlist } from "@/types/api";

export async function listWatchlists(): Promise<Watchlist[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .or(`user_id.eq.${user.id},is_shared.eq.true`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as any;
}

export async function addCompaniesToWatchlist(watchlistId: string, companyIds: string[]): Promise<void> {
  if (!watchlistId) throw { status: 400, message: "Missing watchlist id" };
  
  const insertData = companyIds.map(companyId => ({
    watchlist_id: watchlistId,
    company_id: companyId,
  }));

  const { error } = await supabase
    .from('watchlist_companies')
    .insert(insertData);

  if (error) throw error;
}
