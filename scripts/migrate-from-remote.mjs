import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SRC_URL = process.env.SOURCE_SUPABASE_URL;
const SRC_ANON = process.env.SOURCE_SUPABASE_ANON_KEY;
const DST_URL = process.env.DEST_SUPABASE_URL;
const DST_SERVICE = process.env.DEST_SUPABASE_SERVICE_ROLE_KEY;

if (!SRC_URL || !SRC_ANON || !DST_URL || !DST_SERVICE) {
  console.error('❌ Missing envs. Fill .env.migrate');
  process.exit(1);
}

const src = createClient(SRC_URL, SRC_ANON, { auth: { persistSession: false } });
const dst = createClient(DST_URL, DST_SERVICE, { auth: { persistSession: false } });

// أسماء الجداول الفعلية في Lovable (طبقًا للسكرينشوت)
const tableMap = [
  // srcName            destName           pk(if any)
  ['companies',         'companies',       'id'],
  ['financials',        'financials',      'id'],
  ['events',            'events',          'id'],
  ['forecasts',         'forecasts',       'id'],
  ['alert_rules',       'alert_rules',     'id'],
  ['alert_history',     'alert_history',   'id'],
  ['watchlists',        'watchlists',      'id'],
  ['watchlist_companies','watchlist_companies','id'],
  ['saved_views',       'saved_views',     'id'],
  ['profiles',          'profiles',        'id'],
  ['user_roles',        'user_roles',      'id'],
];

async function copyTable(srcName, destName, pk) {
  // جرّب قراءة صف واحد للتأكد من وجود الجدول والصلاحيات
  const probe = await src.from(srcName).select('*').limit(1);
  if (probe.error) {
    console.warn(`⚠️  Skip '${destName}': cannot read source '${srcName}' (${probe.error.message})`);
    return;
  }

  console.log(`\n==> Copying ${destName} (source: ${srcName})`);
  const pageSize = 1000;
  let from = 0, page = 0;

  while (true) {
    const { data, error } = await src.from(srcName).select('*').range(from, from + pageSize - 1);
    if (error) { console.warn(`   ⚠️ Read error: ${error.message}`); break; }
    if (!data || data.length === 0) break;

    const { error: upErr } = await dst.from(destName).upsert(data, { onConflict: pk });
    if (upErr) {
      console.warn(`   ⚠️ Upsert error on '${destName}': ${upErr.message}`);
      break; // لو فيه اختلاف أعمدة كبير، نوقف هذا الجدول ونكمل الباقي
    }

    from += data.length;
    console.log(`   Page ${++page}: ${data.length} rows`);
    if (data.length < pageSize) break;
  }
}

(async () => {
  for (const [srcName, destName, pk] of tableMap) {
    await copyTable(srcName, destName, pk).catch(e =>
      console.warn(`⚠️  '${destName}' failed: ${e.message || e}`));
  }
  console.log('\n✅ Migration finished (skipped any unreadable/unmatched tables).');
})();
