import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getCompanyById, type CompanyProfile } from "@/services/mockCompanyDetails";

function useQueryId() {
  const [id, setId] = useState<string | undefined>(undefined);
  useEffect(()=> {
    const u = new URL(window.location.href);
    const q = u.searchParams.get("id") || undefined;
    setId(q);
  }, []);
  return id;
}

type TabKey = "overview"|"financials"|"events"|"filings"|"people"|"forecast"|"comparables";

export default function CompanyPage() {
  const id = useQueryId();
  const [data, setData] = useState<CompanyProfile | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCompanyById(id).then(setData).finally(()=>setLoading(false));
  }, [id]);

  const title = useMemo(()=> data?.profile?.name_en ?? "Company", [data]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{title}</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["overview","financials","events","filings","people","forecast","comparables"] as TabKey[]).map(k=>(
            <button
              key={k}
              className={`h-9 rounded-md border px-3 text-sm ${tab===k ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={()=>setTab(k)}
            >
              {k[0].toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>

        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && data && (
          <>
            {tab==="overview" && <Overview data={data} />}
            {tab==="financials" && <Financials data={data} />}
            {tab==="events" && <Events data={data} />}
            {tab==="filings" && <Filings data={data} />}
            {tab==="people" && <People data={data} />}
            {tab==="forecast" && <Forecast data={data} />}
            {tab==="comparables" && <Comparables data={data} />}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function KPI({label, value}:{label:string; value:string|number}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Overview({data}:{data:CompanyProfile}) {
  const s = data.profile;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-5">
        <KPI label="Sector" value={s.sector} />
        <KPI label="Country" value={s.country} />
        <KPI label="Ticker" value={s.ticker ?? '—'} />
        <KPI label="Revenue (last)" value={s.revenue_last?.toLocaleString() ?? '—'} />
        <KPI label="Risk" value={s.risk_score ?? 0} />
      </div>
      <div className="rounded-xl border p-3">
        <div className="font-semibold mb-1">AI Summary (mock)</div>
        <p className="text-sm text-muted-foreground">
          {s.description}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border p-3">
          <div className="font-semibold mb-2">Latest Events (mock)</div>
          <ul className="space-y-2">
            {data.events.slice(0,5).map(e=>(
              <li key={e.id} className="border rounded-md p-2">
                <div className="text-sm">{new Date(e.time).toLocaleString()} — {e.type} <span className="ml-2 text-xs">{e.severity}</span></div>
                <div className="text-sm text-muted-foreground">{e.summary}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-3">
          <div className="font-semibold mb-2">Quick Stats</div>
          <div className="text-sm">Margin: {s.stats?.margin ?? '—'}%</div>
          <div className="text-sm">Debt/Equity: {s.stats?.debt_to_equity ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}

function Financials({data}:{data:CompanyProfile}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">Time series (table fallback)</div>
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-2 text-left">Period</th>
              <th className="p-2 text-left">Revenue</th>
              <th className="p-2 text-left">EBITDA</th>
              <th className="p-2 text-left">Net Income</th>
              <th className="p-2 text-left">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {data.financials.map((r,i)=>(
              <tr key={i} className="border-t">
                <td className="p-2">{r.period}</td>
                <td className="p-2">{r.revenue.toLocaleString()}</td>
                <td className="p-2">{r.ebitda.toLocaleString()}</td>
                <td className="p-2">{r.net_income.toLocaleString()}</td>
                <td className="p-2">{r.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Events({data}:{data:CompanyProfile}) {
  return (
    <div className="space-y-2">
      {data.events.map(e=>(
        <div key={e.id} className="rounded-md border p-2">
          <div className="text-sm">{new Date(e.time).toLocaleString()} — {e.type} <span className="ml-2 text-xs">{e.severity}</span></div>
          <div className="text-sm text-muted-foreground">{e.summary}</div>
        </div>
      ))}
    </div>
  );
}

function Filings({data}:{data:CompanyProfile}) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.filings.map(f=>(
            <tr key={f.id} className="border-t">
              <td className="p-2">{f.date}</td>
              <td className="p-2">{f.doc_type}</td>
              <td className="p-2">
                <a className="underline" href={f.url || "#"}>Preview</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function People({data}:{data:CompanyProfile}) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Since</th>
          </tr>
        </thead>
        <tbody>
          {data.people.map((p,i)=>(
            <tr key={i} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.role}</td>
              <td className="p-2">{p.since}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Forecast({data}:{data:CompanyProfile}) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Horizon</th>
            <th className="p-2 text-left">Forecast</th>
            <th className="p-2 text-left">CI Low</th>
            <th className="p-2 text-left">CI High</th>
            <th className="p-2 text-left">Model</th>
            <th className="p-2 text-left">MAPE</th>
            <th className="p-2 text-left">MAE</th>
          </tr>
        </thead>
        <tbody>
          {data.forecast.map((f,i)=>(
            <tr key={i} className="border-t">
              <td className="p-2">{f.horizon}</td>
              <td className="p-2">{f.value.toLocaleString()}</td>
              <td className="p-2">{f.ci_low.toLocaleString()}</td>
              <td className="p-2">{f.ci_high.toLocaleString()}</td>
              <td className="p-2">{f.model_version}</td>
              <td className="p-2">{f.mape}%</td>
              <td className="p-2">{f.mae.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Comparables({data}:{data:CompanyProfile}) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Company</th>
            <th className="p-2 text-left">Growth</th>
            <th className="p-2 text-left">Profitability</th>
            <th className="p-2 text-left">Leverage</th>
            <th className="p-2 text-left">Risk</th>
          </tr>
        </thead>
        <tbody>
          {data.comparables.map(p=>(
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.growth}</td>
              <td className="p-2">{p.profitability}</td>
              <td className="p-2">{p.leverage}</td>
              <td className="p-2">{p.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

