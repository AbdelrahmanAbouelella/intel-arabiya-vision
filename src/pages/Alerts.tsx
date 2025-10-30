import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { USE_MOCKS } from "@/lib/runtime";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { AlertRule } from "@/types/alerts";

const templates = [
  "risk_score >= 70",
  "revenue_last <= 1000000",
  "risk_score >= 80 sector=Banks",
  "risk_score >= 70 country=KSA",
];

export default function AlertsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'builder'|'history'>('builder');

  // Builder state
  const [name, setName] = useState("");
  const [dsl, setDsl] = useState("risk_score >= 70");
  const [channels, setChannels] = useState<string[]>(["web"]);
  const [active, setActive] = useState(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [matches, setMatches] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [creating, setCreating] = useState(false);

  // History state
  const [hist, setHist] = useState<any[]>([]);
  const [histRuleId, setHistRuleId] = useState<string>("");
  const [histFrom, setHistFrom] = useState<string>("");
  const [histTo, setHistTo] = useState<string>("");
  const [loadingHist, setLoadingHist] = useState(false);

  function parseMockRule(dslStr: string, ch: string[], isActive: boolean): AlertRule {
    // Very naive parser: supports 'risk_score >= N' and optional 'country=XX'/'sector=YY'
    const m = dslStr.match(/risk_score\s*(>=|<=)\s*(\d+)/);
    const op = (m?.[1] as any) || ">=";
    const val = m ? Number(m[2]) : 70;
    const country = (dslStr.match(/country=(\w+)/)?.[1]) as string | undefined;
    const sector = (dslStr.match(/sector=(\w+)/)?.[1]) as string | undefined;
    return {
      id: 'new',
      name: name || dslStr.slice(0, 40),
      active: isActive,
      scope: { country, sector },
      condition: { metric: 'risk_score', op, value: val },
      channels: ch,
      created_at: new Date().toISOString(),
    };
  }

  async function onTest() {
    setTesting(true);
    try {
      if (USE_MOCKS) {
        const mod = await import('@/services/mockAlerts');
        const rule = parseMockRule(dsl, channels, active);
        const res = await mod.testRule(rule);
        setMatches(res.matches);
      } else {
        const mod = await import('@/api/alerts');
        const res = await mod.testRule({ dsl, from: from || undefined, to: to || undefined });
        setMatches(res.matches);
      }
    } catch (e:any) {
      toast({ description: e?.message || 'Test failed' });
    } finally {
      setTesting(false);
    }
  }

  async function onCreate() {
    if (!name.trim()) { toast({ description: 'Enter a rule name' }); return; }
    setCreating(true);
    try {
      if (USE_MOCKS) {
        const mod = await import('@/services/mockAlerts');
        const rule = parseMockRule(dsl, channels, active);
        await mod.createRule({ ...rule, id: undefined as any, created_at: undefined as any } as any);
      } else {
        const mod = await import('@/api/alerts');
        await mod.createRule({ dsl, channels, active, name, scope_org: false });
      }
      toast({ description: 'Rule created' });
    } catch (e:any) {
      toast({ description: e?.message || 'Create failed' });
    } finally {
      setCreating(false);
    }
  }

  async function loadHistory() {
    setLoadingHist(true);
    try {
      if (USE_MOCKS) {
        const mod = await import('@/services/mockAlerts');
        const items = await mod.listHistory();
        const filtered = items.filter(it => (!histRuleId || it.rule_id===histRuleId) && (!histFrom || new Date(it.when) >= new Date(histFrom)) && (!histTo || new Date(it.when) <= new Date(histTo)));
        setHist(filtered);
      } else {
        const mod = await import('@/api/alerts');
        const res = await mod.listHistory({ rule_id: histRuleId || undefined, from: histFrom || undefined, to: histTo || undefined });
        setHist(res.items);
      }
    } catch (e:any) {
      toast({ description: e?.message || 'Failed to load history' });
    } finally {
      setLoadingHist(false);
    }
  }

  useEffect(()=>{ loadHistory(); },[]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold">Alerts</h1>

        <Tabs defaultValue="builder" value={tab} onValueChange={(v)=>setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="builder">Rule Builder</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <Card>
              <CardHeader><CardTitle>Build a Rule (DSL)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-sm mb-1">Name</label>
                    <input className="w-full h-10 rounded-md border px-3 text-sm" value={name} onChange={e=>setName(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">DSL</label>
                    <textarea className="w-full min-h-24 rounded-md border p-2 text-sm" value={dsl} onChange={e=>setDsl(e.target.value)} />
                    <div className="flex gap-2 mt-2 text-xs">
                      {templates.map((t,i)=>(
                        <button key={i} className="rounded border px-2 py-1" onClick={()=>setDsl(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-1">
                    <input id="active" type="checkbox" className="h-4 w-4" checked={active} onChange={e=>setActive(e.target.checked)} />
                    <label htmlFor="active" className="text-sm">Active</label>
                  </div>
                  <div className="text-sm">Channels:</div>
                  {['email','sms','slack','webhook','web'].map(ch => (
                    <label key={ch} className="text-sm inline-flex items-center gap-1">
                      <input type="checkbox" checked={channels.includes(ch)} onChange={(e)=>{
                        setChannels(prev => e.target.checked ? [...prev, ch] : prev.filter(x=>x!==ch));
                      }} /> {ch}
                    </label>
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    <label className="text-sm">From</label>
                    <input type="date" className="h-9 rounded-md border px-2 text-sm" value={from} onChange={e=>setFrom(e.target.value)} />
                    <label className="text-sm">To</label>
                    <input type="date" className="h-9 rounded-md border px-2 text-sm" value={to} onChange={e=>setTo(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="h-10 rounded-md border px-3 text-sm" disabled={testing} onClick={onTest}>{testing?'Testing…':'Test'}</button>
                  <button className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground" disabled={creating} onClick={onCreate}>{creating?'Creating…':'Create'}</button>
                </div>

                <div className="rounded border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40"><tr>
                      <th className="p-2 text-left">Company</th>
                      <th className="p-2 text-left">Risk</th>
                      <th className="p-2 text-left">Revenue</th>
                      <th className="p-2 text-left">Country</th>
                      <th className="p-2 text-left">Sector</th>
                    </tr></thead>
                    <tbody>
                      {USE_MOCKS ? (
                        matches.map((m:any)=>(
                          <tr key={m.company_id} className="border-t">
                            <td className="p-2">{m.company_name}</td>
                            <td className="p-2">{m.snapshot?.risk_score ?? '—'}</td>
                            <td className="p-2">{(m.snapshot?.revenue_last ?? 0).toLocaleString()}</td>
                            <td className="p-2">{m.snapshot?.country}</td>
                            <td className="p-2">{m.snapshot?.sector}</td>
                          </tr>
                        ))
                      ) : (
                        matches.map((m:any,i:number)=>(
                          <tr key={i} className="border-t"><td className="p-2" colSpan={5}><pre className="text-xs">{JSON.stringify(m)}</pre></td></tr>
                        ))
                      )}
                      {matches.length===0 && <tr><td className="p-2 text-muted-foreground">No matches</td></tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="block text-sm mb-1">Rule ID</label>
                    <input className="h-9 rounded-md border px-2 text-sm" value={histRuleId} onChange={e=>setHistRuleId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">From</label>
                    <input type="date" className="h-9 rounded-md border px-2 text-sm" value={histFrom} onChange={e=>setHistFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">To</label>
                    <input type="date" className="h-9 rounded-md border px-2 text-sm" value={histTo} onChange={e=>setHistTo(e.target.value)} />
                  </div>
                  <button className="h-9 rounded-md border px-3 text-sm" onClick={loadHistory} disabled={loadingHist}>{loadingHist? 'Loading…':'Apply'}</button>
                </div>

                <div className="rounded border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40"><tr>
                      <th className="p-2 text-left">Triggered At</th>
                      <th className="p-2 text-left">Company</th>
                      <th className="p-2 text-left">Summary</th>
                      <th className="p-2 text-left">Channels</th>
                    </tr></thead>
                    <tbody>
                      {USE_MOCKS ? (
                        hist.map((h:any,i:number)=>(
                          <tr key={i} className="border-t">
                            <td className="p-2">{new Date(h.when).toLocaleString()}</td>
                            <td className="p-2">{h.company_name}</td>
                            <td className="p-2">{h.summary}</td>
                            <td className="p-2">{h.delivered_channels.join(', ')}</td>
                          </tr>
                        ))
                      ) : (
                        hist.map((h:any,i:number)=>(
                          <tr key={i} className="border-t">
                            <td className="p-2">{new Date(h.triggered_at || h.when || h.time).toLocaleString()}</td>
                            <td className="p-2">{h.company?.name_en || h.company_name || h.company}</td>
                            <td className="p-2">{h.summary || h.text || '-'}</td>
                            <td className="p-2">{Array.isArray(h.delivered_channels)?h.delivered_channels.join(', '): (h.channels || '-')}</td>
                          </tr>
                        ))
                      )}
                      {hist.length===0 && <tr><td className="p-2 text-muted-foreground">No history</td></tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

