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

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const cursor = url.searchParams.get('cursor');

    let query = supabase
      .from('events')
      .select(`
        id,
        event_type,
        event_date,
        title_en,
        title_ar,
        summary_en,
        summary_ar,
        severity,
        sentiment,
        source_type,
        companies (
          name_en,
          name_ar,
          ticker
        )
      `)
      .order('event_date', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('event_date', cursor);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    // Transform to expected format
    const items = events?.map((event: any) => ({
      id: event.id,
      company: event.companies?.name_en || 'Unknown',
      type: event.event_type,
      time: event.event_date,
      severity: event.severity,
      sentiment: event.sentiment,
      source: event.source_type || 'Unknown',
      summary: event.summary_en || event.title_en,
    })) || [];

    const nextCursor = items.length === limit ? items[items.length - 1].time : null;

    return new Response(
      JSON.stringify({
        items,
        cursor_next: nextCursor,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
