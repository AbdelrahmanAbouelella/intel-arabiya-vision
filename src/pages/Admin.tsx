import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import type { ApiKey } from "@/types/admin";
import { USE_MOCKS } from "@/lib/runtime";

const adminApi = {
  listApiKeys: async () => (await import("@/services/mockAdmin")).listApiKeys(),
  createApiKey: async (label: string, scopes: string[]) => (await import("@/services/mockAdmin")).createApiKey(label, scopes),
  toggleApiKey: async (id: string, active: boolean) => (await import("@/services/mockAdmin")).toggleApiKey(id, active),
  deleteApiKey: async (id: string) => (await import("@/services/mockAdmin")).deleteApiKey(id),
  listAudit: async () => (await import("@/services/mockAdmin")).listAudit(),
};

type Tab = "users" | "keys" | "audit" | "retention";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Admin</h1>
          {USE_MOCKS && <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-xs border border-amber-300">Mock Mode</span>}
        </div>
        <div className="flex gap-2">
          {(["users","keys","audit","retention"] as Tab[]).map(t=>(
            <button key={t} className={`h-9 rounded-md border px-3 text-sm ${tab===t?'bg-primary text-primary-foreground':''}`} onClick={()=>setTab(t)}>
              {t==="users"?"Users & Roles":t==="keys"?"API Keys":t==="audit"?"Audit Log":"Data Retention"}
            </button>
          ))}
        </div>
        {tab==="users" && <UsersRolesTab />}
        {tab==="keys" && <ApiKeysTab />}
        {tab==="audit" && <AuditTab />}
        {tab==="retention" && <DataRetentionTab />}
      </div>
    </AppLayout>
  );
}

/* -------- Users & Roles (UI only) -------- */
function UsersRolesTab() {
  const roles = [
    { key: 'Org Admin', desc: 'Full admin access across organization.' },
    { key: 'Analyst', desc: 'Create alerts, manage watchlists, access data.' },
    { key: 'Viewer', desc: 'Read-only access.' },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map(r => (
          <div key={r.key} className="rounded-xl border p-3">
            <div className="font-semibold">{r.key}</div>
            <div className="text-sm text-muted-foreground">{r.desc}</div>
            <div className="mt-2 flex gap-2">
              <button className="h-8 rounded-md border px-2 text-xs">Assign</button>
              <button className="h-8 rounded-md border px-2 text-xs">Manage</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-3">
        <div className="font-semibold mb-2">Users</div>
        <div className="text-sm text-muted-foreground">User management UI placeholder (invite, suspend, reset MFA).</div>
      </div>
    </div>
  );
}

/* -------- API Keys -------- */
function ApiKeysTab() {
  const [keys,setKeys]=useState<ApiKey[]>([]);
  const [label,setLabel]=useState("");
  const [scopes,setScopes]=useState("read:*");

  async function refresh(){ setKeys(await adminApi.listApiKeys()); }
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
              const res = await adminApi.createApiKey(label.trim(), scopes.split(",").map(s=>s.trim()).filter(Boolean));
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
                  <button className="h-8 rounded-md border px-2 text-xs" onClick={async()=>{ await adminApi.toggleApiKey(k.id, !k.active); await refresh(); }}>
                    {k.active?"Disable":"Enable"}
                  </button>
                  <button className="h-8 rounded-md border px-2 text-xs" onClick={async()=>{ if(confirm("Delete key?")) { await adminApi.deleteApiKey(k.id); await refresh(); }}}>
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
  const [rows,setRows]=useState<any[]>([]);
  async function refresh(){ setRows(await adminApi.listAudit()); }
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
              {new Date(r.at).toLocaleString()} • <b>{r.action}</b> {r.entity?`on ${r.entity}`:""} {r.entity_id?`#${r.entity_id}`:""}
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

/* -------- Data Retention (UI only) -------- */
function DataRetentionTab() {
  const [eventsDays, setEventsDays] = useState(180);
  const [auditDays, setAuditDays] = useState(365);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-3 space-y-3">
        <div className="font-semibold">Retention Policies</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm mb-1">Events retention (days)</div>
            <input type="number" className="h-9 rounded-md border px-2 text-sm" value={eventsDays} onChange={e=>setEventsDays(Number(e.target.value))} />
          </div>
          <div>
            <div className="text-sm mb-1">Audit log retention (days)</div>
            <input type="number" className="h-9 rounded-md border px-2 text-sm" value={auditDays} onChange={e=>setAuditDays(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground">Save</button>
          <button className="h-9 rounded-md border px-3 text-sm">Export Audit Log</button>
        </div>
      </div>
    </div>
  );
}

