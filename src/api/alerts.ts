import { supabase } from "@/integrations/supabase/client";

export const createRule = async (payload: { dsl: string; channels: string[]; active: boolean; name: string; scope_org?: boolean }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('alert_rules')
    .insert({
      user_id: user.id,
      name: payload.name,
      is_active: payload.active,
      scope_filters: {},
      conditions: { dsl: payload.dsl },
      actions: { channels: payload.channels },
      severity: 'medium',
    })
    .select()
    .single();

  if (error) throw error;
  return { id: data.id };
};

export const testRule = async (payload: { dsl: string; from?: string; to?: string }) => {
  // Mock implementation - in real app this would test the rule against data
  return { matches: [] };
};

export const listHistory = async (q: { rule_id?: string; from?: string; to?: string }) => {
  let query = supabase
    .from('alert_history')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(50);

  if (q.rule_id) {
    query = query.eq('rule_id', q.rule_id);
  }
  if (q.from) {
    query = query.gte('triggered_at', q.from);
  }
  if (q.to) {
    query = query.lte('triggered_at', q.to);
  }

  const { data, error } = await query;
  if (error) throw error;

  return { items: data || [] };
};
