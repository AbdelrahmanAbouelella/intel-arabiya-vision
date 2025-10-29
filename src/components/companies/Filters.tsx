import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { companiesFacetOptions } from "@/services/mockCompanies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CompaniesQuery } from "@/types/companies";

type Props = {
  value: CompaniesQuery;
  onChange: (v: CompaniesQuery) => void;
  onSearch: () => void;
  rightSlot?: ReactNode; // Save View button
};

export default function Filters({ value, onChange, onSearch, rightSlot }: Props) {
  const [riskRange, setRiskRange] = useState<[number,number]>([
    value.risk_min ?? 0,
    value.risk_max ?? 100
  ]);

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="grid gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <Label>Search</Label>
          <Input
            placeholder="Name / Ticker / ISIN"
            value={value.query || ""}
            onChange={e => onChange({ ...value, query: e.target.value })}
          />
        </div>

        <div>
          <Label>Sector</Label>
          <Select value={value.sector} onValueChange={(v)=>onChange({...value, sector: v})}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {companiesFacetOptions.sectors.map(s=>(
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Country</Label>
          <Select value={value.country} onValueChange={(v)=>onChange({...value, country: v})}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {companiesFacetOptions.countries.map(s=>(
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Exchange</Label>
          <Select value={value.exchange} onValueChange={(v)=>onChange({...value, exchange: v})}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {companiesFacetOptions.exchanges.map(s=>(
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 grid items-end gap-3 md:grid-cols-5">
        <div className="md:col-span-3">
          <Label>Risk band</Label>
          <div className="px-2">
            <Slider
              value={riskRange}
              min={0}
              max={100}
              step={1}
              onValueChange={(v:any)=>setRiskRange(v as [number,number])}
              onValueCommit={(v:any)=>onChange({...value, risk_min: v[0], risk_max: v[1]})}
            />
            <div className="mt-1 text-xs text-muted-foreground">From {riskRange[0]} to {riskRange[1]}</div>
          </div>
        </div>

        <div className="flex gap-2 justify-end md:col-span-2">
          {rightSlot}
          <Button onClick={onSearch}>Search</Button>
        </div>
      </div>
    </div>
  );
}

