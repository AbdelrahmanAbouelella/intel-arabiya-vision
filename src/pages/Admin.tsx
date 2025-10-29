<<<<<<< HEAD
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import type { RiskWeights, ApiKey } from "@/types/admin";
import { getRiskWeights, updateRiskWeights, previewRiskScore, listApiKeys, createApiKey, toggleApiKey, deleteApiKey, listAudit } from "@/services/mockAdmin";

type Tab = "risk" | "keys" | "audit";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("risk");
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Admin</h1>
        <div className="flex gap-2">
          {(["risk","keys","audit"] as Tab[]).map(t=>(
            <button key={t} className={`h-9 rounded-md border px-3 text-sm ${tab===t?'bg-primary text-primary-foreground':''}`} onClick={()=>setTab(t)}>
              {t==="risk"?"Risk Weights":t==="keys"?"API Keys":"Audit Log"}
            </button>
          ))}
        </div>
        {tab==="risk" && <RiskWeightsTab />}
        {tab==="keys" && <ApiKeysTab />}
        {tab==="audit" && <AuditTab />}
      </div>
    </AppLayout>
  );
}

/* -------- Risk Weights -------- */
function RiskWeightsTab() {
  const [w,setW] = useState<RiskWeights|null>(null);
  const [preview,setPreview] = useState<{score:number; breakdown:Record<string,number>}|null>(null);
  const [saving,setSaving] = useState(false);

  useEffect(()=>{ getRiskWeights().then(setW); },[]);

  async function doPreview(nw: RiskWeights){
    const p = await previewRiskScore(nw);
    setPreview(p);
  }

  if(!w) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const fields:(keyof RiskWeights)[] = ["volatility","leverage","neg_event_rate","sentiment_trend","exec_churn","filing_delays"];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {fields.map(f=>(
          <div key={f} className="rounded-xl border p-3">
            <div className="text-sm font-medium mb-2">{f.replaceAll("_"," ")}</div>
            <input type="range" min={0} max={100} value={w[f]} onChange={e=>{
              const nw = {...w, [f]: Number(e.target.value)} as RiskWeights;
              setW(nw); doPreview(nw);
            }} className="w-full"/>
            <div className="text-sm mt-2">Weight: <b>{w[f]}</b></div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">Preview (mock)</div>
          <div className="text-sm text-muted-foreground">Composite risk score based on current weights.</div>
        </div>
        <div className="text-3xl font-bold">{preview?.score ?? "-"}</div>
      </div>

      <div className="flex gap-2">
        <button className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground" disabled={saving} onClick={async()=>{ setSaving(true); await updateRiskWeights(w); setSaving(false); alert("Saved"); }}>
          {saving? "Saving…" : "Save"}
        </button>
        <button className="h-10 rounded-md border px-3 text-sm" onClick={()=>getRiskWeights().then(x=>{ setW(x); setPreview(null); })}>Reset</button>
      </div>
    </div>
  );
}

/* -------- API Keys -------- */
function ApiKeysTab() {
  const [keys,setKeys]=useState<ApiKey[]>([]);
  const [label,setLabel]=useState("");
  const [scopes,setScopes]=useState("read:*");

  async function refresh(){ setKeys(await listApiKeys()); }
  useEffect(()=>{ refresh(); },[]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-3">
        <div className="font-semibold mb-2">Create API Key</div>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <div className="text-sm mb-1">Label</div>
            <input className="h-10 rounded-md border px-3 text-sm" value={label} onChange={e=>setLabel(e.target.value)}/>
          </div>
          <div>
            <div className="text-sm mb-1">Scopes (comma)</div>
            <input className="h-10 rounded-md border px-3 text-sm" value={scopes} onChange={e=>setScopes(e.target.value)}/>
          </div>
          <button className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={async()=>{
            if(!label.trim()) return;
            const res = await createApiKey(label.trim(), scopes.split(",").map(s=>s.trim()).filter(Boolean));
            alert(`Created. Token preview: ${res.token_preview}`);
            setLabel(""); await refresh();
          }}>Create</button>
        </div>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-2 text-left">Label</th>
              <th className="p-2 text-left">Preview</th>
              <th className="p-2 text-left">Scopes</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k=>(
              <tr key={k.id} className="border-t">
                <td className="p-2">{k.label}</td>
                <td className="p-2">{k.token_preview}</td>
                <td className="p-2">{k.scopes.join(", ")}</td>
                <td className="p-2">{k.active?"Yes":"No"}</td>
                <td className="p-2">{new Date(k.created_at).toLocaleString()}</td>
                <td className="p-2 flex gap-2">
                  <button className="h-8 rounded-md border px-2 text-xs" onClick={async()=>{ await toggleApiKey(k.id, !k.active); await refresh(); }}>
                    {k.active?"Disable":"Enable"}
                  </button>
                  <button className="h-8 rounded-md border px-2 text-xs" onClick={async()=>{ if(confirm("Delete key?")) { await deleteApiKey(k.id); await refresh(); }}}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {keys.length===0 && <tr><td className="p-2 text-muted-foreground">No keys</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------- Audit Log -------- */
function AuditTab() {
  const [rows,setRows]=useState<Awaited<ReturnType<typeof listAudit>>>([]);
  async function refresh(){ setRows(await listAudit()); }
  useEffect(()=>{ refresh(); },[]);
  return (
    <div className="rounded-xl border p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">Audit Log</div>
        <button className="h-8 rounded-md border px-2 text-xs" onClick={refresh}>Refresh</button>
      </div>
      <div className="space-y-2">
        {rows.map(r=>(
          <div key={r.id} className="rounded-md border p-2">
            <div className="text-sm">
              {new Date(r.at).toLocaleString()} — <b>{r.action}</b> {r.entity?`on ${r.entity}`:""} {r.entity_id?`#${r.entity_id}`:""}
            </div>
            {r.before && <div className="text-xs text-muted-foreground">before: {JSON.stringify(r.before)}</div>}
            {r.after && <div className="text-xs text-muted-foreground">after: {JSON.stringify(r.after)}</div>}
          </div>
        ))}
        {rows.length===0 && <div className="text-sm text-muted-foreground">No audit records yet</div>}
      </div>
    </div>
  );
}
=======
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.admin')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Admin features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Admin;
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
