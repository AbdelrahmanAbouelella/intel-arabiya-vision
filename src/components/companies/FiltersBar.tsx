import React from 'react';
import type { CompaniesQuery } from '@/types/companies';

export type Filters = CompaniesQuery & {
  mcap_min?: number;
  mcap_max?: number;
};

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  onSearch?: () => void;
  onReset?: () => void;
};

export default function FiltersBar({ value, onChange, onSearch, onReset }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Search</label>
          <input
            className="w-full h-10 rounded-md border px-3 text-sm"
            placeholder="Name / Ticker / ISIN"
            value={value.query || ''}
            onChange={e => set({ query: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Sector</label>
          <select
            className="w-full h-10 rounded-md border px-3 text-sm"
            value={value.sector || ''}
            onChange={e => set({ sector: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option>Banks</option>
            <option>Energy</option>
            <option>Telecom</option>
            <option>Materials</option>
            <option>Consumer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Country</label>
          <select
            className="w-full h-10 rounded-md border px-3 text-sm"
            value={value.country || ''}
            onChange={e => set({ country: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option>KSA</option>
            <option>UAE</option>
            <option>Egypt</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Exchange</label>
          <select
            className="w-full h-10 rounded-md border px-3 text-sm"
            value={value.exchange || ''}
            onChange={e => set({ exchange: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option>Tadawul</option>
            <option>DFM</option>
            <option>EGX</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Market Cap Min</label>
          <input
            type="number"
            className="w-full h-10 rounded-md border px-3 text-sm"
            value={value.mcap_min ?? ''}
            onChange={e => set({ mcap_min: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Market Cap Max</label>
          <input
            type="number"
            className="w-full h-10 rounded-md border px-3 text-sm"
            value={value.mcap_max ?? ''}
            onChange={e => set({ mcap_max: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-6 items-end">
        <div className="md:col-span-4">
          <label className="block text-sm mb-1">Risk band (0-100)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              className="w-24 h-10 rounded-md border px-2 text-sm"
              value={value.risk_min ?? ''}
              onChange={e => set({ risk_min: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
            <span>to</span>
            <input
              type="number"
              min={0}
              max={100}
              className="w-24 h-10 rounded-md border px-2 text-sm"
              value={value.risk_max ?? ''}
              onChange={e => set({ risk_max: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-2">
          <button className="h-10 rounded-md border px-3 text-sm" onClick={onReset}>Reset</button>
          <button className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={onSearch}>Search</button>
        </div>
      </div>
    </div>
  );
}

