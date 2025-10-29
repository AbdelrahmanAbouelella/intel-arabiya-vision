import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import type { AlertRule } from "@/types/alerts";
import { listRules, createRule, toggleRule, testRule, runNow, listHistory } from "@/services/mockAlerts";

const countries = ["KSA","UAE","Egypt"];
const sectors = ["Banks","Energy","Telecom","Materials","Consumer"];

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [hist, setHist] = useState<Awaited<ReturnType<typeof listHistory>>>([]);

  // form state
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [metric, setMetric] = useState<"risk_score"|"revenue_last">("risk_score");
  const [op, setOp] = useState<">="|"<=">(">=");
  const [value, setValue] = useState<number>(70);
  const [channels, setChannels] = useState<string>("web");

  async function refresh() {
    const [r, h] = await Promise.all([listRules(), listHistory()]);
    setRules(r);
    setHist(h);
  }

  useEffect(()=>{ refresh(); },[]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold">Alerts</h1>

        {/* Create Rule */}
        <div className="rounded-xl border p-3 space-y-3">
          <div className="font-semibold">Create a Rule (mock DSL)</div>
          <div className="grid gap-2 md:grid-cols-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full h-10 rounded-md border px-3 text-sm" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Country</label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={country} onChange={e=>setCountry(e.target.value)}>
                <option value="">Any</option>
                {countries.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Sector</label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={sector} onChange={e=>setSector(e.target.value)}>
                <option value="">Any</option>
                {sectors.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <select className="h-10 rounded-md border px-2 text-sm" value={metric} onChange={e=>setMetric(e.target.value as any)}>
                <option value="risk_score">risk_score</option>
                <option value="revenue_last">revenue_last</option>
              </select>
              <select className="h-10 rounded-md border px-2 text-sm" value={op} onChange={e=>setOp(e.target.value as any)}>
                <option value=">=">{">="}</option>
                <option value="<=">{"<="}</option>
              </select>
              <input type="number" className="w-24 h-10 rounded-md border px-2 text-sm" value={value} onChange={e=>setValue(Number(e.target.value))}/>
            </div>
            <div className="flex gap-2">
              <input className="h-10 rounded-md border px-2 text-sm" value={channels} onChange={e=>setChannels(e.target.value)} />
              <button
                className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground"
                onClick={async ()=>{
                  if (!name.trim()) return;
                  const payload: Omit<AlertRule,"id"|"created_at"> = {
                    name: name.trim(),
                    active: true,
                    scope: { country: country || undefined, sector: sector || undefined },
                    condition: { metric, op, value },
                    channels: channels.split(",").map(s=>s.trim()).filter(Boolean),
                  };
                  await createRule(payload);
                  setName("");
                  await refresh();
                }}
              >Create</button>
            </div>
          </div>
        </div>

        {/* Rules list */}
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Scope</th>
                <th className="p-2 text-left">Condition</th>
                <th className="p-2 text-left">Channels</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">
                    {r.scope?.country || "Any"} / {r.scope?.sector || "Any"}
                  </td>
                  <td className="p-2">{r.condition.metric} {r.condition.op} {r.condition.value}</td>
                  <td className="p-2">{r.channels.join(", ")}</td>
                  <td className="p-2">{r.active ? "Yes":"No"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="h-8 rounded-md border px-2 text-xs"
                      onClick={async ()=>{
                        setLoading(true);
                        const n = await runNow(r.id);
                        setLoading(false);
                        alert(`Triggered. Matches: ${n}`);
                        await refresh();
                      }}
                    >Run now</button>
                    <button
                      className="h-8 rounded-md border px-2 text-xs"
                      onClick={async ()=>{ await toggleRule(r.id, !r.active); await refresh(); }}
                    >{r.active ? "Disable":"Enable"}</button>
                    <DryRunButton rule={r} />
                  </td>
                </tr>
              ))}
              {rules.length===0 && <tr><td className="p-2 text-muted-foreground">No rules</td></tr>}
            </tbody>
          </table>
        </div>

        {/* History */}
        <div className="rounded-xl border p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">History</div>
            <button className="h-8 rounded-md border px-2 text-xs" onClick={refresh} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
          <div className="space-y-2">
            {hist.map((h,i)=>(
              <div key={i} className="rounded-md border p-2">
                <div className="text-sm">{new Date(h.when).toLocaleString()} — <b>{h.company_name}</b></div>
                <div className="text-xs text-muted-foreground">{h.summary}</div>
                <div className="text-xs">Channels: {h.delivered_channels.join(", ")}</div>
              </div>
            ))}
            {hist.length===0 && <div className="text-sm text-muted-foreground">No history yet</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function DryRunButton({rule}:{rule:AlertRule}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<{company_id:string; company_name:string; snapshot:any}[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button
        className="h-8 rounded-md border px-2 text-xs"
        onClick={async ()=>{
          setOpen(true); setLoading(true);
          const r = await testRule(rule);
          setRows(r.matches);
          setLoading(false);
        }}
      >Dry-run</button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={()=>setOpen(false)}>
          <div className="bg-white rounded-lg w-[800px] max-w-[95vw] p-3 space-y-2" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div className="font-semibold">Dry-run Matches ({rows.length})</div>
              <button className="h-8 rounded-md border px-2 text-xs" onClick={()=>setOpen(false)}>Close</button>
            </div>
            <div className="rounded border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-2 text-left">Company</th>
                    <th className="p-2 text-left">Risk</th>
                    <th className="p-2 text-left">Revenue</th>
                    <th className="p-2 text-left">Country</th>
                    <th className="p-2 text-left">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td className="p-2 text-muted-foreground">Loading…</td></tr>}
                  {!loading && rows.map(r=>(
                    <tr key={r.company_id} className="border-t">
                      <td className="p-2">{r.company_name}</td>
                      <td className="p-2">{r.snapshot.risk_score ?? "—"}</td>
                      <td className="p-2">{(r.snapshot.revenue_last ?? 0).toLocaleString()}</td>
                      <td className="p-2">{r.snapshot.country}</td>
                      <td className="p-2">{r.snapshot.sector}</td>
                    </tr>
                  ))}
                  {!loading && rows.length===0 && <tr><td className="p-2 text-muted-foreground">No matches</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

