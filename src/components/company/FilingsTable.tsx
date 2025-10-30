import type { CompanyProfile } from "@/types/api";

type Props = {
  items: CompanyProfile['filings'];
};

export default function FilingsTable({ items }: Props) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Link</th>
          </tr>
        </thead>
        <tbody>
          {items.map(f => (
            <tr key={f.id} className="hover:bg-muted/30 border-t">
              <td className="p-2">{f.date}</td>
              <td className="p-2">{f.doc_type}</td>
              <td className="p-2">
                {f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="underline">Open</a> : '—'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td className="p-4 text-muted-foreground">No filings</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

