import * as React from "react";
import { useMemo } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { CompanyRow } from "@/types/companies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  data: CompanyRow[];
  onAddToWatchlist?: (ids: string[]) => void;
};

export default function ResultsTable({ data, onAddToWatchlist }: Props) {
  const columns = useMemo<ColumnDef<CompanyRow>[]>(() => [
    {
      id: 'select',
      header: () => null,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={e => row.toggleSelected(e.target.checked)}
        />
      ),
      size: 40
    },
    { accessorKey: 'name_en', header: 'Company' },
    { accessorKey: 'sector', header: 'Sector' },
    { accessorKey: 'country', header: 'Country' },
    { accessorKey: 'ticker', header: 'Ticker' },
    {
      accessorKey: 'revenue_last',
      header: 'Revenue',
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>();
        return v ? v.toLocaleString() : '—';
      },
    },
    {
      accessorKey: 'net_income_last',
      header: 'Net Income',
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>();
        return v ? v.toLocaleString() : '—';
      },
    },
    {
      accessorKey: 'risk_score',
      header: 'Risk',
      cell: ({ getValue }) => {
        const v = (getValue<number | undefined>()) ?? 0;
        const color = v>70?'text-red-600':v>40?'text-amber-600':'text-green-600';
        return <span className={`font-medium ${color}`}>{v}</span>;
      },
    },
    {
      id: 'last_event',
      header: 'Last Event',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground line-clamp-1">
          {row.original.last_event_summary?.text ?? '—'}
          {row.original.sentiment && (
            <Badge className="ml-2" variant="outline">{row.original.sentiment}</Badge>
          )}
        </div>
      )
    }
  ], []);

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable<CompanyRow>({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection }
  });

  const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id);

  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between p-2">
        <div className="text-sm text-muted-foreground">
          {data.length.toLocaleString()} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={selectedIds.length === 0}
            onClick={() => onAddToWatchlist?.(selectedIds)}
          >
            Add to Watchlist
          </Button>
        </div>
      </div>

      <table className="w-full border-t">
        <thead className="bg-muted/40">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id} className="p-2 text-left text-sm font-medium">
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(r => (
            <tr key={r.id} className="hover:bg-muted/30">
              {r.getVisibleCells().map(c => (
                <td key={c.id} className="p-2 align-top text-sm">
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td className="p-4 text-sm text-muted-foreground">No results</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

