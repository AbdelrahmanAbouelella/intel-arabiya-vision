import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL!;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});
