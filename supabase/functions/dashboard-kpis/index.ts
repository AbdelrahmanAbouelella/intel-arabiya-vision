import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept-language',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total companies count
    const { count: companiesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    // Get events count today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get events count last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get open alerts count (using alert_history as proxy)
    const { count: alertsCount } = await supabase
      .from('alert_history')
      .select('*', { count: 'exact', head: true })
      .gte('triggered_at', weekAgo.toISOString());

    const kpis = [
      {
        key: 'companies_covered',
        label: 'Companies Covered',
        value: companiesCount || 0,
        delta: 2.5,
      },
      {
        key: 'new_items_today',
        label: 'New Items Today',
        value: todayEvents || 0,
        delta: 12.3,
      },
      {
        key: 'new_items_week',
        label: 'New Items (7d)',
        value: weekEvents || 0,
        delta: 8.1,
      },
      {
        key: 'open_alerts',
        label: 'Open Alerts',
        value: alertsCount || 0,
        delta: -5.2,
      },
      {
        key: 'market_risk',
        label: 'Market Risk Index',
        value: 58,
        delta: 3.4,
      },
    ];

    return new Response(JSON.stringify(kpis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
